from fastapi import APIRouter, HTTPException
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

async def fetch_html(session, url):
    """Fetch HTML content of a page."""
    await asyncio.sleep(random.uniform(10, 20))
    async with session.get(url, headers=headers) as response:
        text = await response.text()
        if "Security Check" in text or "captcha" in text.lower():
            print("Blocked by CAPTCHA. Exiting...")
            return None
        return text
    
@router.get("/jobs", response_model=list[Job])
async def scrape_jobs_with_selenium():
    service = Service('/opt/homebrew/bin/chromedriver')  # Update with the correct path to chromedriver
    options = Options()
    ua = UserAgent()
    options.add_argument(f"user-agent={ua.random}")
    options.add_argument("--headless")
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

    driver = webdriver.Chrome(service=service)
    driver.execute_cdp_cmd("Page.addScriptToEvaluateOnNewDocument", {
        "source": """
        Object.defineProperty(navigator, 'webdriver', {get: () => undefined});
        """
    })
    driver.get(BASE_URL)
    driver.add_cookie({'name': 'mosaic-disable-banner', 'value': 'true'})
    driver.refresh()
    driver.implicitly_wait(10)
    results = []
    try:
        WebDriverWait(driver, 10).until(
            EC.presence_of_element_located((By.CLASS_NAME, 'job_seen_beacon'))
        )
    except Exception:
        print("Popup detected, attempting to close.")
        # Try closing popup
        try:
            continue_button = WebDriverWait(driver, 5).until(
                EC.element_to_be_clickable((By.CSS_SELECTOR, "button[aria-label='Continue With Browser']"))
            )
            continue_button.click()
        except Exception as e:
            print(f"Failed to close popup: {e}")

    results = []
    try:
        jobs = driver.find_elements(By.CLASS_NAME, 'job_seen_beacon')[:3]
        for job in jobs:
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

                # Append job details to results
                results.append({
                    'title': title,
                    'application_url': application_url,
                    'company': company_name,
                    'location': location,
                    'salary': salary,
                    'benefits': benefits,
                })
            except Exception as e:
                print(f"Error extracting job details: {e}")
        
    except Exception as e:
        print(f"Error finding job cards: {e}")
    finally:
        driver.quit()
    return results

