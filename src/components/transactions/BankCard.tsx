import { cn } from '@/utils/cn';

interface BankCardProps {
    accountName: string;
    cardNumber: string;
    valid: string;
    expiry: string;
    hue: number;
    isSelected?: boolean;
    pendingCount?: number;
    onClick?: () => void;
}

export function BankCard({
    accountName,
    cardNumber,
    valid,
    expiry,
    hue,
    isSelected = false,
    pendingCount = 0,
    onClick,
}: BankCardProps) {
    return (
        <button
            type="button"
            onClick={onClick}
            className={cn(
                'w-96 h-56 flex-none rounded-xl relative text-white shadow-2xl transition-all duration-300 transform focus:outline-none focus-visible:ring-2 focus-visible:ring-green-600 focus-visible:ring-offset-2 overflow-hidden',
                isSelected
                    ? 'ring-2 ring-primary hover:scale-105 blur-0 z-20'
                    : 'grayscale blur-[2px] scale-85 opacity-75 hover:scale-95 hover:blur-none hover:opacity-100 z-10'
            )}
        >
            {/* Background Image with gradient overlay */}
            <img
                className="absolute inset-0 object-cover w-full h-full rounded-xl"
                src="https://i.imgur.com/kGkSg1v.png"
                alt=""
                style={{
                    filter: `hue-rotate(${hue}deg) saturate(1.15)`,
                }}
            />

            {/* Content Overlay */}
            <div className="w-full px-8 absolute top-8 z-10">
                <div className="flex justify-between">
                    <div className="text-left">
                        <p className="font-light text-white">Name</p>
                        <p className="font-medium tracking-widest text-white">
                            {accountName}
                        </p>
                    </div>
                    <div className="flex items-center gap-2">
                        {pendingCount > 0 && (
                            <div className="rounded-full bg-white/20 text-white text-xs h-max font-semibold px-2 py-0.5">
                                {pendingCount}
                            </div>
                        )}
                        <img
                            className="w-14 h-14"
                            src="https://i.imgur.com/bbPHJVe.png"
                            alt="MasterCard"
                        />
                    </div>
                </div>

                <div className="pt-1  ">
                    <p className="font-light  text-left text-white">
                        Card Number
                    </p>
                    <p className="font-medium  text-left tracking-wider text-white">
                        {cardNumber}
                    </p>
                </div>

                <div className="pt-6 pr-6">
                    <div className="flex justify-between">
                        <div className="">
                            <p className="font-light text-xs text-white">
                                Valid
                            </p>
                            <p className="font-medium tracking-wider text-sm text-white">
                                {valid}
                            </p>
                        </div>
                        <div className="">
                            <p className="font-light text-xs text-white">
                                Expiry
                            </p>
                            <p className="font-medium tracking-wider text-sm text-white">
                                {expiry}
                            </p>
                        </div>
                        <div className="">
                            <p className="font-light text-xs text-white">CVV</p>
                            <p className="font-bold tracking-wider text-sm text-white">
                                ···
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </button>
    );
}
