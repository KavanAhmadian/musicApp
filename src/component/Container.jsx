"use client";

import React from "react";

const Container = ({ children, className = "" }) => {
    return (
        <div className={`container mx-auto px-4 sm:px-4 lg:px-6 ${className}`}>
            {children}
        </div>
    );
};

export default Container;
