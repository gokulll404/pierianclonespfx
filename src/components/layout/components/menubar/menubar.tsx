import * as React from 'react';
const { useState, useEffect, useRef, useContext } = React;
import './menuBar.css';
import {
    AdminPortal,
    BusinessHeads,
    BusinessLimits,
    CheckoutReport,
    CompanyForms,
    EmployeeDirectory,
    EmployeeReport,
    HelpDesk,
    MarketPlace,
    More
} from '../../../../utils/icons/Icons';

import { useNavigate } from 'react-router-dom';
import { appsRequired } from '../../../../utils/customSettings';
import { spContext } from '../../../../App';

interface App {
    icon: React.ReactElement;
    title: string;
    color: string;
    path?: string;
    external?: boolean;
    required?: boolean;
}

const baseApps: App[] = [
    { icon: <CompanyForms />, title: 'Company Forms', color: '#ec4899', path: '/company-forms' },
    { icon: <EmployeeReport />, title: 'Employee Report', color: '#f97316' },
    { icon: <EmployeeDirectory />, title: 'Employee Directory', color: '#eab308', path: '/employee-directory' },
    { icon: <BusinessHeads />, title: 'Business Units', color: '#3b82f6', path: '/business-units' },
    { icon: <MarketPlace />, title: 'Marketplace', color: '#6366f1' },
    { icon: <CheckoutReport />, title: 'Checkout Report', color: '#ec4899' },
    { icon: <BusinessLimits />, title: 'Business Limits', color: '#f59e0b' },
    { icon: <HelpDesk />, title: 'Help Desk', color: '#3b82f6' },
    { icon: <AdminPortal />, title: 'Admin Panel', color: '#64748b', path: '/admin' }
];

interface MoreDropdownProps {
    items: App[];
    onItemClick: (item: App) => void;
}

const MoreDropdown: React.FC<MoreDropdownProps> = ({ items, onItemClick }) => {
    const [isOpen, setIsOpen] = useState<boolean>(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    return (
        <div className="appContainer" ref={dropdownRef} onClick={() => setIsOpen(!isOpen)}>
            <div className="appIcon" style={{ backgroundColor: '#06b6d4' }}>
                <More />
            </div>
            <p className="appTitle">More</p>

            {isOpen && (
                <div className="dropdown">
                    {items.map((app, index) => (
                        <div
                            key={index}
                            className="dropdownItem"
                            onClick={() => {
                                onItemClick(app);
                                setIsOpen(false);
                            }}
                        >
                            <div className="dropdownIcon" style={{ background: app.color }}>
                                {React.cloneElement(app.icon, {
                                    style: { fontSize: '16px', color: '#ffffff' }
                                })}
                            </div>
                            <span>{app.title}</span>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

const MenuBar: React.FC = () => {
    const [isMobile, setIsMobile] = useState<boolean>(false);
    const [apps, setApps] = useState<App[]>([]);
    const [currentDateTime, setCurrentDateTime] = useState<string>("");
    const navigate = useNavigate();
    const { sp, context } = useContext(spContext);

    const userName = context.pageContext.user.displayName || 'User';

    const getGreeting = () => {
        const hour = new Date().getHours();
        if (hour < 12) return 'Good Morning';
        if (hour < 18) return 'Good Afternoon';
        return 'Good Evening';
    };

    const formatDateTime = (): string => {
        const now = new Date();
        const date = now.toLocaleDateString('en-US', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
        const time = now.toLocaleTimeString('en-US', {
            hour: '2-digit',
            minute: '2-digit',
            hour12: true
        });
        return `${time} ${date}`;
    };

    const handleAppClick = (app: App): void => {
        if (app.external) {
            window.open(app.path, "_blank");
            return;
        }

        if (app.path) navigate(app.path);
    };

    useEffect(() => {
        const updateTime = () => {
            setCurrentDateTime(formatDateTime());
        };

        updateTime();

        const now = new Date();
        const msUntilNextMinute = (60 - now.getSeconds()) * 1000 - now.getMilliseconds();

        const timeout = setTimeout(() => {
            updateTime();
            const interval = setInterval(updateTime, 60000);
            return () => clearInterval(interval);
        }, msUntilNextMinute);

        return () => clearTimeout(timeout);
    }, []);


    useEffect(() => {
        const handleResize = () => setIsMobile(window.innerWidth < 768);
        handleResize();
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);


    useEffect(() => {
        const checkAdminAndSetApps = async () => {
            try {
                const currentUser = await sp.web.currentUser.select("IsSiteAdmin")();
                const isAdmin = currentUser.IsSiteAdmin;

                const updatedApps = baseApps.map(app => {
                    const defaultRequired =
                        appsRequired.find(req => req.title === app.title)?.required ?? true;

                    if (app.title === "Admin Panel") {
                        return { ...app, required: isAdmin };
                    }

                    if (app.title === "Employee Directory" && !isAdmin) {
                        return {
                            ...app,
                            required: defaultRequired,
                            path: "https://search.zoho.com/searchhome",
                            external: true,
                        };
                    }

                    return { ...app, required: defaultRequired };
                });

                setApps(updatedApps);
            } catch (err) {
                const updatedApps = baseApps.map(app => ({
                    ...app,
                    required: appsRequired.find(req => req.title === app.title)?.required ?? true,
                }));
                setApps(updatedApps);
            }
        };

        if (sp) checkAdminAndSetApps();
    }, [sp]);


    const filteredApps = apps.filter(app => app.required !== false);
    const visibleApps = isMobile ? filteredApps : filteredApps.slice(0, 4);
    const moreApps = filteredApps.slice(4);

    return (
        <div className="menuBar">
            <div className="leftSection">
                <p className="dateTime">{currentDateTime}</p>
                <h2 className="greeting">
                    {getGreeting()}, {userName} <span className="emoji">👋</span>
                </h2>
            </div>

            {isMobile ? (
                <div className="mobileMenuContainer">
                    {filteredApps.map((app, index) => (
                        app.external ? (
                            <a key={index} className="appContainer" href={app.path} target="_blank" rel="noopener noreferrer">
                                <div className="appIcon" style={{ backgroundColor: app.color }}>{app.icon}</div>
                                <p className="appTitle">{app.title}</p>
                            </a>
                        ) : (
                            <div key={index} className="appContainer" onClick={() => handleAppClick(app)}>
                                <div className="appIcon" style={{ backgroundColor: app.color }}>{app.icon}</div>
                                <p className="appTitle">{app.title}</p>
                            </div>
                        )
                    ))}
                </div>
            ) : (
                <div className="rightSection">

                    {/* ⭐ FIXED Need Help Link */}
                    <div
                        className="appContainer"
                    >
                        <div className="appIcon" style={{ backgroundColor: "#3b82f6" }}>
                            <HelpDesk />
                        </div>
                        <p className="appTitle">Need Help?</p>
                    </div>
                    {/* ⭐ END FIXED ITEM */}

                    {visibleApps.map((app, index) => (
                        app.external ? (
                            <a
                                key={index}
                                className="appContainer"
                                href={app.path}
                                target="_blank"
                                rel="noopener noreferrer"
                                style={{ textDecoration: "none", color: "inherit" }}
                            >
                                <div className="appIcon" style={{ backgroundColor: app.color }}>
                                    {app.icon}
                                </div>
                                <p className="appTitle">{app.title}</p>
                            </a>
                        ) : (
                            <div
                                key={index}
                                className="appContainer"
                                onClick={() => handleAppClick(app)}
                            >
                                <div className="appIcon" style={{ backgroundColor: app.color }}>
                                    {app.icon}
                                </div>
                                <p className="appTitle">{app.title}</p>
                            </div>
                        )
                    ))}

                    {moreApps.length > 0 && (
                        <MoreDropdown items={moreApps} onItemClick={handleAppClick} />
                    )}

                </div>

            )}
        </div>
    );
};

export default MenuBar;
