import React, { useEffect, useState } from 'react';
import axios from 'axios';

interface Job {
    title: string;
    company: string;
    location: string;
    application_url: string;
    salary: string;
}

const JobsPage: React.FC = () => {
    const [jobs, setJobs] = useState<Job[]>([]); // Ensure jobs is initialized as an empty array
    const [error, setError] = useState<string | null>(null); // Track API errors
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchJobs = async () => {
            try {
                const response = await axios.get('http://127.0.0.1:8000/api/jobs');
                console.log("Fetched Jobs:", response.data); // Debugging
                setJobs(response.data); // Set jobs to the response data
            } catch (err) {
                console.error("Error fetching jobs:", err);
                setError("Failed to fetch jobs. Please try again later.");
            } finally {
                setLoading(false);
            }
        };

        fetchJobs();
    }, []);

    if (loading) return <p>Loading jobs...</p>;

    return (
        <div>
            <h1>Job Listings</h1>
            {error ? ( // Display an error message if the API request fails
                <p>{error}</p>
            ) : jobs.length === 0 ? ( // Check if jobs is an empty array
                <p>No jobs available at the moment.</p>
            ) : (
                <ul>
                    {jobs.map((job, index) => (
                        <li key={index}>
                            <h2>{job.title}</h2>
                            <p><strong>Company:</strong> {job.company}</p>
                            <p><strong>Location:</strong> {job.location}</p>
                            <p><strong>Salary:</strong> {job.salary}</p>
                            <p><strong>Apply :</strong> {job.application_url}</p>
                            <a href={job.application_url} target="_blank" rel="noopener noreferrer">Apply Here</a>
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
};

export default JobsPage;

