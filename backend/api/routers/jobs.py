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

router = APIRouter()
proxy_list = []

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
    options = webdriver.ChromeOptions()
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

    driver = webdriver.Chrome(service=service, options=options)
    driver.execute_cdp_cmd("Page.addScriptToEvaluateOnNewDocument", {
        "source": """
        Object.defineProperty(navigator, 'webdriver', {
        get: () => undefined
        })
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
        jobs = driver.find_elements(By.CLASS_NAME, 'job_seen_beacon')
    except Exception as e:
        print(f"Error finding job cards: {e}")
    finally:
        driver.quit()
    return results


