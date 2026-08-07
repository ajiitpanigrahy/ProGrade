import React from 'react';
import PublicLayout from '../../layouts/PublicLayout';

export default function CookiesPolicy() {
    return (
        <PublicLayout>
            <div className="max-w-4xl mx-auto px-6 py-16 md:py-24">
                <h1 className="text-4xl md:text-5xl font-extrabold mb-8 text-gray-900 dark:text-white">Cookies Policy</h1>
                <p className="text-gray-500 dark:text-gray-400 mb-12">Last updated: August 2026</p>

                <div className="space-y-8 text-gray-700 dark:text-gray-300 leading-relaxed">
                    <section>
                        <h2 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white">1. What are Cookies?</h2>
                        <p>Cookies are small text files stored on your device to help websites function properly, enhance user experience, and analyze site traffic.</p>
                    </section>

                    <section>
                        <h2 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white">2. How Pro Grade Uses Cookies</h2>
                        <div className="overflow-x-auto mt-4">
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="border-b border-gray-200 dark:border-purple-900/50">
                                        <th className="py-3 px-4 font-bold text-gray-900 dark:text-white">Type</th>
                                        <th className="py-3 px-4 font-bold text-gray-900 dark:text-white">Purpose</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <tr className="border-b border-gray-100 dark:border-purple-900/20">
                                        <td className="py-3 px-4 font-semibold text-purple-600 dark:text-purple-400">Strictly Necessary</td>
                                        <td className="py-3 px-4">Required for platform operation. This includes JSON Web Tokens (JWT) for secure login sessions and dark mode preference tracking.</td>
                                    </tr>
                                    <tr className="border-b border-gray-100 dark:border-purple-900/20">
                                        <td className="py-3 px-4 font-semibold text-purple-600 dark:text-purple-400">Assessment Integrity</td>
                                        <td className="py-3 px-4">Temporary session tokens used during active exams to prevent unauthorized resubmissions or state tampering.</td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                    </section>
                </div>
            </div>
        </PublicLayout>
    );
}