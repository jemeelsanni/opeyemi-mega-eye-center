import React from "react";
import { motion, Variants } from "framer-motion";
import {
    FaRegClock,
    FaEye,
    FaUserMd,
    FaHospitalUser,
    FaCalendarCheck
} from "react-icons/fa";

interface StepProps {
    number: number;
    icon: React.ReactNode;
    title: string;
    description: string;
}

const VisitGuide: React.FC = () => {
    const steps: StepProps[] = [
        {
            number: 1,
            icon: <FaRegClock className="text-white text-2xl" />,
            title: "Registration",
            description: "Arrive at the hospital on time to complete the necessary registration formalities. A full comprehensive eye exam can take up to 3 hours. Duration may vary based on individual circumstances.",
        },
        {
            number: 2,
            icon: <FaEye className="text-white text-2xl" />,
            title: "Dilation Process",
            description: "Note that a comprehensive eye exam may include dilation which will leave your vision blurry for about 2 to 3 hours. Hence, it is advisable to have someone accompany you for the visit who is able to drive or guide you back home.",
        },
        {
            number: 3,
            icon: <FaUserMd className="text-white text-2xl" />,
            title: "Consultation",
            description: "A visit will normally include multiple consultations with an Optometrist as well as an Ophthalmologist. During your visit, feel free to ask any questions or concerns relating to your eye health.",
        },
        {
            number: 4,
            icon: <FaHospitalUser className="text-white text-2xl" />,
            title: "Referrals & Prescriptions",
            description: "You could be referred to another unit for further evaluation e.g. investigations, to see a sub-specialist, or be advised on surgery, eye glasses, and medication as may be required.",
        },
        {
            number: 5,
            icon: <FaCalendarCheck className="text-white text-2xl" />,
            title: "Follow-up",
            description: "At the end of a visit, a follow-up appointment will be made as required at the registration desks in the hospital before leaving.",
        },
    ];

    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                staggerChildren: 0.2,
                delayChildren: 0.3,
            },
        },
    };

    const itemVariants = {
        hidden: { y: 20, opacity: 0 },
        visible: {
            y: 0,
            opacity: 1,
            transition: {
                type: "spring",
                stiffness: 100,
            },
        },
    };

    return (
        <section className="py-16 bg-[#FFA50080]">
            <div className="container mx-auto px-4">
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.7 }}
                    className="text-center mb-12"
                >
                    <h2 className="text-3xl md:text-4xl font-bold text-gray-800 mb-4">
                        A Step-by-Step Guide for Your Hospital Visit
                    </h2>
                    <p className="text-lg text-gray-600 max-w-3xl mx-auto">
                        Know what to expect during your visit to Opeyemi Mega Eye Center
                    </p>
                </motion.div>

                <motion.div
                    variants={containerVariants}
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true }}
                    className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6"
                >
                    {steps.map((step) => (
                        <StepCard
                            key={step.number}
                            number={step.number}
                            icon={step.icon}
                            title={step.title}
                            description={step.description}
                            variants={itemVariants}
                        />
                    ))}
                </motion.div>
            </div>
        </section>
    );
};

const StepCard: React.FC<StepProps & { variants: Variants }> = ({
    number,
    icon,
    title,
    description,
    variants
}) => {
    return (
        <motion.div
            variants={variants}
            className="bg-white rounded-lg shadow-md overflow-hidden flex flex-col items-center p-6 h-full transition-transform duration-300 hover:-translate-y-1 hover:shadow-lg"
        >
            <div className="relative mb-6">
                <div className="h-16 w-16 rounded-full bg-[#FFA500] flex items-center justify-center">
                    {icon}
                </div>
                <div className="absolute -bottom-2 -right-2 h-8 w-8 rounded-full bg-[#FFA500] flex items-center justify-center text-white font-bold text-lg">
                    {number}
                </div>
            </div>

            <h3 className="text-xl font-bold text-gray-800 mb-3 text-center">
                {title}
            </h3>

            <p className="text-gray-600 text-center">
                {description}
            </p>
        </motion.div>
    );
};

export default VisitGuide;