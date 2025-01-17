import React, { useEffect, useState } from 'react';
import axios from 'axios';

// Define the type for a job listing
interface Job {
    title: string;
    company: string;
    location: string;
    application_url: string;
}

const JobListings: React.FC = () => {
    const [jobs, setJobs] = useState<Job[]>([]); // State for job listings
    const [loading, setLoading] = useState<boolean>(true); // State for loading indicator

    useEffect(() => {
        const fetchJobs = async () => {
            try {
                console.log("Fetching from: http://127.0.0.1:8000/api/jobs");
                const response = await axios.get<Job[]>('http://127.0.0.1:8000/api/jobs'); // Specify the type of response data
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
