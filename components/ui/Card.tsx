import type { ReactNode } from "react";

type CardProps = {
    children: ReactNode;
    className?: string;
};

export default function Card({
    children,
    className = "",
}: CardProps) {
    return (
        <div
            className={`
                rounded-[1.35rem]
                border
                border-[#ded6c9]
                bg-[#fffdf8]
                p-5
                shadow-[0_12px_32px_rgba(82,66,44,0.07)]
                ${className}
            `}
        >
            {children}
        </div>
    );
}