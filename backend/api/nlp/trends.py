from collections import Counter
from typing import List, Dict
from nltk.corpus import stopwords
from nltk.tokenize import word_tokenize


def get_trending_topics(posts: List[Dict]) -> List[Dict]:
    topic_counter = Counter()
    for post in posts:
        topic_counter.update(post['topics'])
    return topic_counter.most_common()

def get_trending_keywords(posts: List[Dict]) -> List[Dict]:
    stop_words = set(stopwords.words('english'))
    word_counter = Counter()

    for post in posts:
        words = word_tokenize(post['content'].lower())
        filtered_words = [word for word in words if word.isalnum() and word not in stop_words]
        word_counter.update(filtered_words)

    return word_counter.most_common()