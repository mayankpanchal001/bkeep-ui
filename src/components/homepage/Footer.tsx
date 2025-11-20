import { Link } from 'react-router';
import { APP_TITLE } from '../../constants';
import { logo } from '../../utills/image';

export default function Footer() {
    return (
        <footer className="homepage-footer border-t border-primary-10 bg-white">
            <div className="mx-auto max-w-6xl px-6 py-12">
                <div className="grid grid-cols-2 gap-8 md:grid-cols-4">
                    <div>
                        <div className="flex items-center gap-2 mb-4">
                            <img
                                src={logo}
                                alt={APP_TITLE}
                                className="h-8 w-auto object-contain"
                            />
                            <span className="text-lg font-bold text-primary">
                                {APP_TITLE}
                            </span>
                        </div>
                        <p className="text-sm text-primary-50">
                            Modern accounting for global businesses.
                        </p>
                    </div>
                    <div>
                        <h4 className="font-semibold text-primary mb-4">
                            Product
                        </h4>
                        <ul className="space-y-2 text-sm text-primary-50">
                            <li>
                                <Link
                                    to="/"
                                    className="hover:text-primary transition-colors"
                                >
                                    Features
                                </Link>
                            </li>
                            <li>
                                <Link
                                    to="/"
                                    className="hover:text-primary transition-colors"
                                >
                                    Pricing
                                </Link>
                            </li>
                            <li>
                                <Link
                                    to="/"
                                    className="hover:text-primary transition-colors"
                                >
                                    Security
                                </Link>
                            </li>
                        </ul>
                    </div>
                    <div>
                        <h4 className="font-semibold text-primary mb-4">
                            Company
                        </h4>
                        <ul className="space-y-2 text-sm text-primary-50">
                            <li>
                                <Link
                                    to="/"
                                    className="hover:text-primary transition-colors"
                                >
                                    About
                                </Link>
                            </li>
                            <li>
                                <Link
                                    to="/"
                                    className="hover:text-primary transition-colors"
                                >
                                    Blog
                                </Link>
                            </li>
                            <li>
                                <Link
                                    to="/"
                                    className="hover:text-primary transition-colors"
                                >
                                    Careers
                                </Link>
                            </li>
                        </ul>
                    </div>
                    <div>
                        <h4 className="font-semibold text-primary mb-4">
                            Support
                        </h4>
                        <ul className="space-y-2 text-sm text-primary-50">
                            <li>
                                <Link
                                    to="/"
                                    className="hover:text-primary transition-colors"
                                >
                                    Help Center
                                </Link>
                            </li>
                            <li>
                                <Link
                                    to="/"
                                    className="hover:text-primary transition-colors"
                                >
                                    Contact
                                </Link>
                            </li>
                            <li>
                                <Link
                                    to="/"
                                    className="hover:text-primary transition-colors"
                                >
                                    Privacy
                                </Link>
                            </li>
                        </ul>
                    </div>
                </div>
                <div className="mt-12 border-t border-primary-10 pt-8 text-center text-sm text-primary-50">
                    <p>
                        © {new Date().getFullYear()} {APP_TITLE}. All rights
                        reserved.
                    </p>
                </div>
            </div>
        </footer>
    );
}

