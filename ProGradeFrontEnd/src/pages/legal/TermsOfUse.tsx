import React from 'react';
import PublicLayout from '../../layouts/PublicLayout';

export default function TermsOfUse() {
    return (
        <PublicLayout>
            <div className="max-w-4xl mx-auto px-6 py-16 md:py-24">
                <h1 className="text-4xl md:text-5xl font-extrabold mb-8 text-gray-900 dark:text-white">Terms of Use</h1>
                <p className="text-gray-500 dark:text-gray-400 mb-12">Last updated: August 2026</p>

                <div className="space-y-8 text-gray-700 dark:text-gray-300 leading-relaxed">
                    <section>
                        <h2 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white">1. Acceptance of Terms</h2>
                        <p>By accessing and using Pro Grade, you agree to be bound by these Terms of Use. If you disagree with any part of these terms, you may not access the platform.</p>
                    </section>

                    <section>
                        <h2 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white">2. User Responsibilities</h2>
                        <ul className="list-disc pl-6 space-y-2">
                            <li><strong>Educators:</strong> You retain ownership of the assessment content you create. You agree not to upload malicious code or inappropriate content.</li>
                            <li><strong>Students:</strong> You agree to adhere to academic integrity. The submission of AI-generated code (unless explicitly permitted), plagiarism, or attempts to reverse-engineer the sandbox environment will result in immediate assessment invalidation.</li>
                        </ul>
                    </section>

                    <section>
                        <h2 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white">3. AI Evaluation Disclaimer</h2>
                        <p>Pro Grade utilizes advanced machine learning frameworks to assist in grading and code evaluation. While our multi-agent architecture aims for high accuracy, automated scores should be considered supplementary. Final grading authority rests with the human Educator.</p>
                    </section>
                </div>
            </div>
        </PublicLayout>
    );
}