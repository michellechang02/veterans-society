import React, { useEffect, useState } from 'react';
import axios from 'axios';

const JobListings = () => {
    const [jobs, setJobs] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchJobs = async () => {
            try {
                console.log("Fetching from: http://127.0.0.1:8000/api/jobs");
                const response = await axios.get('http://127.0.0.1:8000/api/jobs');
                console.log("Fetched Jobs:", response.data);
                setJobs(response.data);
                setLoading(false);
            } catch (error) {
                console.error("Error fetching jobs:", error);
                setLoading(false);
            }
        };

        fetchJobs();
    }, []);

    if (loading) return <p>Loading jobs...</p>;

    return (
        <div>
            <h1>Job Listings for Veterans</h1>
            <ul>
                {jobs.map((job, index) => (
                    <li key={index}>
                        <h2>{job.title}</h2>
                        <p>{job.company} - {job.location}</p>
                        <a href={job.application_url} target="_blank" rel="noopener noreferrer">
                            Apply Here
                        </a>
                    </li>
                ))}
            </ul>
        </div>
    );
};

export default JobListings;
