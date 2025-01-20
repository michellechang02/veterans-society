from typing import Optional
from fastapi import APIRouter, HTTPException, Query
from pydantic import BaseModel
from bs4 import BeautifulSoup
from api.models.job import Job
import traceback
import requests
import aiohttp
import random
import time
import asyncio
from selenium import webdriver
from selenium.webdriver.chrome.service import Service
from selenium.webdriver.common.by import By
from fake_useragent import UserAgent
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from selenium.webdriver.chrome.options import Options

router = APIRouter()

# will change later
BASE_URL = 'https://www.indeed.com/jobs?q=data+engineer&l=United+States'
headers = {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
    'Accept-Language': 'en-US,en;q=0.9',
    'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
    'Connection': 'keep-alive',}

''' Location (string): Location of the job (e.g., 'Seattle, WA'). Use spaces.
    'Remote', 'Seattle, WA', 'New York, NY', 'San Francisco, CA', 'Austin, TX', 
    'McLean, VA', 'Chicago, IL', 'Dallas, TX, 'Washington, DC', 'San Jose, CA',
    'Atlanta, GA', 'Sunnyvale, CA', 'Boston MA', 'Bellevue, WA'

Job type (string): Job type: 'Full-time' or 'Part-time', 'Permanent',
'Internship', 'Contract', 'Temporary', 'Seasonal', 'Apprenticeship', 'Temp-to-hire', 'Non-tenure'.

Pay: 'All salaries', '105,000+', '120,000+', '135,000+', '155,000', '175,000', 'Only show jobs with pay information'.
Experience level: 'All', 'Entry level', 'Mid level', 'Senior level', 'No Experience Required'.

Education: 'All Educational Levels', 'High school degreee', 'Associate level', 'Bachelor's level', 'Master's level', 'Doctoral level'.

Encouraged to apply: 'Fair Chance', 'Military encouraged', 'Back to Work', 'No Degree'.
'''

@router.get("/jobs", response_model=list[Job])
async def scrape_jobs_with_selenium(
):
    keywords = "data engineer"
    location = "Remote"
    job_type = "Full-time"
    pay = None
    experience_level = None
    education = None
    encouraged = None
    BASE_URL = 'https://www.indeed.com/jobs?q=data+engineer&l=United+States'
    if not keywords:
        raise HTTPException(status_code=400, detail="Keywords must be provided.")
    if location:
        BASE_URL = f"https://www.indeed.com/jobs?q={keywords.replace(' ', '+')}&l={location.replace(' ', '+')}"
    else:
        BASE_URL = f"https://www.indeed.com/jobs?q={keywords.replace(' ', '+')}&l=United+States"

        
    query_params = {
        "q": keywords,
        "l": location
    }

    service = Service('/opt/homebrew/bin/chromedriver')  # Update with the correct path to chromedriver
    options = Options()
    ua = UserAgent()
    options.add_argument(f"user-agent={ua.random}")
    #options.add_argument("--headless")
    options.add_argument("--disable-blink-features=AutomationControlled")
    options.add_argument("--disable-gpu")
    options.add_argument("--no-sandbox")
    options.add_argument("--disable-dev-shm-usage")
    options.add_argument("--disable-popup-blocking")
    options.add_argument("--disable-features=IsolateOrigins,site-per-process")
    options.add_experimental_option("excludeSwitches", ["enable-automation"])
    options.add_experimental_option("useAutomationExtension", False)
    options.add_argument("start-maximized")
    options.add_argument("--disable-blink-features=AutomationControlled")
    
    driver = webdriver.Chrome(service=service, options=options)
    driver.execute_cdp_cmd("Page.addScriptToEvaluateOnNewDocument", {
        "source": """
        Object.defineProperty(navigator, 'webdriver', {get: () => undefined});
        """
        })
    driver.get(BASE_URL)
    driver.add_cookie({'name': 'mosaic-disable-banner', 'value': 'true'})
    driver.refresh()
    time.sleep(5)
    results = []
    try:
        WebDriverWait(driver, 10).until(
            EC.presence_of_element_located((By.CLASS_NAME, 'job_seen_beacon'))
        )
    except Exception:
        print("Popup detected, attempting to close.")
        # Try closing popup
        # Handle Continue Button (dynamic selector for "Continue With Browser")
    try:
        continue_button = WebDriverWait(driver, 10).until(
            EC.element_to_be_clickable((By.XPATH, "//button[@aria-label='Continue With Browser']"))
        )
        driver.execute_script("arguments[0].scrollIntoView(true);", continue_button)  # Scroll into view if needed
        continue_button.click()
        print("Successfully clicked the 'Continue With Browser' button.")
    except Exception as e:
        print(f"Failed to click the 'Continue With Browser' button: {e}")

    try:
        # Apply Job Type Filter
        if job_type:
            print("JOB TYPE filter was chosen. Applying:")
            job_type_button = WebDriverWait(driver, 10).until(
                EC.element_to_be_clickable((By.XPATH, "//button[contains(text(), 'Job Type')]")
            ))
            job_type_button.click()
            job_type_option = WebDriverWait(driver, 10).until(
                EC.element_to_be_clickable((By.XPATH, f"//span[contains(text(), '{job_type}')]")
            ))
            job_type_option.click()

        # Apply Pay Filter
        if pay:
            if pay != "All salaries":
                print("PAY filter was chosen. Applying:")
                pay_button = WebDriverWait(driver, 10).until(
                    EC.element_to_be_clickable((By.XPATH, "//button[contains(text(), 'Salary')]")
                ))
                pay_button.click()
                pay_option = WebDriverWait(driver, 10).until(
                    EC.element_to_be_clickable((By.XPATH, f"//span[contains(text(), '{pay}')]")
                ))
                pay_option.click()

        # Apply Experience Level Filter
        if experience_level:
            print("EXPERIENCE filter was chosen. Applying:")
            if experience_level != "All":
                experience_button = WebDriverWait(driver, 10).until(
                    EC.element_to_be_clickable((By.XPATH, "//button[contains(text(), 'Experience Level')]")
                ))
                experience_button.click()
                experience_option = WebDriverWait(driver, 10).until(
                    EC.element_to_be_clickable((By.XPATH, f"//span[contains(text(), '{experience_level}')]")
                ))
                experience_option.click()

        # Apply Education Filter
        if education:
            print("EDUCATION filter was chosen. Applying:")
            if education != "All Educational Levels":
                education_button = WebDriverWait(driver, 10).until(
                    EC.element_to_be_clickable((By.XPATH, "//button[contains(text(), 'Education')]")
                ))
                education_button.click()
                education_option = WebDriverWait(driver, 10).until(
                    EC.element_to_be_clickable((By.XPATH, f"//span[contains(text(), '{education}')]")
                ))
                education_option.click()

        # Apply Encouraged to Apply Filter
        if encouraged:
            print("Encouraged filter was chosen. Applying:")
            encouraged_button = WebDriverWait(driver, 10).until(
                EC.element_to_be_clickable((By.XPATH, "//button[contains(text(), 'Encouraged to Apply')]")
            ))
            encouraged_button.click()
            encouraged_option = WebDriverWait(driver, 10).until(
                EC.element_to_be_clickable((By.XPATH, f"//span[contains(text(), '{encouraged}')]")
            ))
            encouraged_option.click()

        # Wait for the results to refresh
        WebDriverWait(driver, 10).until(
            EC.presence_of_element_located((By.CLASS_NAME, "job_seen_beacon"))
        )
        jobs = driver.find_elements(By.CLASS_NAME, "job_seen_beacon")
        for job in jobs[:10]:  # Limit to first 10 jobs
            try:
                title_element = job.find_element(By.CLASS_NAME, 'jcs-JobTitle')
                title = title_element.text

                # Extract company name
                company_name_element = job.find_element(By.CSS_SELECTOR, "[data-testid='company-name']")
                company_name = company_name_element.text

                # Extract application link
                application_url = title_element.get_attribute('href')

                # Extract job location
                location_element = job.find_element(By.CSS_SELECTOR, "[data-testid='text-location']")
                location = location_element.text

                # Extract salary range (if available)
                try:
                    salary_element = job.find_element(By.CLASS_NAME, 'css-1rqpxry')
                    salary = salary_element.text
                except Exception:
                    salary = "Not specified"

                # Extract job benefits (if available)
                try:
                    benefits_element = job.find_element(By.CLASS_NAME, 'css-1gvv06p')
                    benefits = benefits_element.text
                except Exception:
                    benefits = "Not specified"
                results.append({
                    'title': title,
                    'application_url': application_url,
                    'company': company_name,
                    'location': location,
                    'salary': salary,
                    'benefits': benefits,
                })
            except Exception:
                pass
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error fetching jobs: {e}")
    finally:
        driver.quit()
    return results