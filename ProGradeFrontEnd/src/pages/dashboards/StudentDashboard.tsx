import DashboardLayout from '../../layouts/DashboardLayout';

export default function StudentDashboard() {
    return (
        <DashboardLayout role="STUDENT">
            <div className="grid gap-6">
                
                {/* Welcome Card */}
                <div className="bg-white dark:bg-[#1a0d36] rounded-2xl p-8 border border-gray-100 dark:border-purple-900/30 shadow-sm">
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Welcome back, Ajit! 👋</h2>
                    <p className="text-gray-600 dark:text-gray-400">Ready to ace your next technical assessment?</p>
                </div>

                {/* Placeholder Quick Actions */}
                <div className="grid sm:grid-cols-2 gap-6">
                    <div className="bg-gradient-to-br from-purple-600 to-fuchsia-600 rounded-2xl p-8 text-white shadow-lg relative overflow-hidden group cursor-pointer">
                        <div className="relative z-10">
                            <h3 className="text-xl font-bold mb-2">Join an Exam</h3>
                            <p className="text-purple-100 mb-6 text-sm">Got a 6-digit access code from your educator?</p>
                            <button className="bg-white text-purple-700 px-6 py-2.5 rounded-lg font-bold text-sm hover:bg-gray-50 transition-colors shadow-md">
                                Enter Code
                            </button>
                        </div>
                        {/* Decorative circle */}
                        <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-white/10 rounded-full blur-2xl group-hover:scale-150 transition-transform duration-700"></div>
                    </div>
                    
                    <div className="bg-white dark:bg-[#1a0d36] rounded-2xl p-8 border border-gray-100 dark:border-purple-900/30 shadow-sm flex flex-col justify-center">
                         <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-1">Recent Results</h3>
                         <p className="text-gray-500 dark:text-gray-400 text-sm mb-4">You have no recent exam results.</p>
                         <button className="text-purple-600 dark:text-purple-400 font-semibold text-sm self-start hover:underline">
                             View all history &rarr;
                         </button>
                    </div>
                </div>

            </div>
        </DashboardLayout>
    );
}