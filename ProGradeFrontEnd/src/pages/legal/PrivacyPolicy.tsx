import React from 'react';
import PublicLayout from '../../layouts/PublicLayout';

export default function PrivacyPolicy() {
    return (
        <PublicLayout>
            <div className="max-w-4xl mx-auto px-6 py-16 md:py-24">
                <h1 className="text-4xl md:text-5xl font-extrabold mb-8 text-gray-900 dark:text-white">Privacy Policy</h1>
                <p className="text-gray-500 dark:text-gray-400 mb-12">Last updated: August 2026</p>

                <div className="space-y-8 text-gray-700 dark:text-gray-300 leading-relaxed">
                    <section>
                        <h2 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white">1. Introduction</h2>
                        <p>Welcome to Pro Grade. We are committed to protecting your personal information and your right to privacy. This policy explains how we collect, use, and safeguard your data when you use our AI-driven technical assessment platform.</p>
                    </section>

                    <section>
                        <h2 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white">2. Data We Collect</h2>
                        <ul className="list-disc pl-6 space-y-2">
                            <li><strong>Account Information:</strong> Name, email address, role (Educator/Student), and profile picture.</li>
                            <li><strong>Assessment Data:</strong> Code submissions, multiple-choice answers, time taken, and calculated scores.</li>
                            <li><strong>Technical Data:</strong> IP address, browser type, and device details to ensure platform security and prevent cheating during assessments.</li>
                        </ul>
                    </section>

                    <section>
                        <h2 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white">3. How We Use Your Data</h2>
                        <p>Your data is strictly utilized to operate the Pro Grade platform. Code submissions may be processed by our Autonomous Cognitive Engine to provide automated grading, complexity analysis, and actionable feedback. We do not sell your personal data or assessment results to third parties.</p>
                    </section>
                </div>
            </div>
        </PublicLayout>
    );
}