import React from "react";

const ActionCard = ({ title, description, icon, buttonText, onClick, variant = "primary" }) => {
    const variants = {
        primary: "bg-primary-600 hover:bg-primary-700 text-white shadow-primary-200",
        secondary: "bg-teal-600 hover:bg-teal-700 text-white shadow-teal-200",
        accent: "bg-indigo-600 hover:bg-indigo-700 text-white shadow-indigo-200",
    };

    const buttonClass = `w-full py-2.5 px-4 rounded-xl font-medium transition-all duration-200 shadow-lg hover:shadow-xl active:scale-[0.98] ${variants[variant]}`;

    return (
        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)] transition-shadow duration-300 flex flex-col h-full">
            <div className="mb-4">
                <span className="text-3xl mb-3 block">{icon}</span>
                <h3 className="text-xl font-bold text-slate-900 mb-2">{title}</h3>
                <p className="text-slate-500 text-sm leading-relaxed">{description}</p>
            </div>
            <div className="mt-auto pt-4">
                <button onClick={onClick} className={buttonClass}>
                    {buttonText}
                </button>
            </div>
        </div>
    );
};

export default ActionCard;
