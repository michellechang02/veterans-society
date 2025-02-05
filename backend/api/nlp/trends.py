from collections import Counter
from typing import List, Dict
from nltk.corpus import stopwords
import nltk



def get_trending_topics(posts: List[Dict]) -> List[Dict]:
    topic_counter = Counter()
    for post in posts:
        topic_counter.update(post['topics'])
    return topic_counter.most_common()

def get_trending_keywords(posts: List[Dict]) -> List[Dict]:
    try:
        # Download stopwords if not already downloaded
        nltk.download('stopwords', quiet=True)
        stop_words = set(stopwords.words('english'))
        word_counter = Counter()

        for post in posts:
            # Simple word splitting instead of word_tokenize
            words = post['content'].lower().split()
            filtered_words = [word for word in words if word.isalnum() and word not in stop_words]
            word_counter.update(filtered_words)

        return word_counter.most_common()
    except Exception as e:
        print(f"Error in keyword extraction: {str(e)}")
        return []