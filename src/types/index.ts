// Type for the application will come here

export type SidebarItemProps = {
    label: string;
    icon: React.ReactElement;
    path?: string;
};

export type PostType = {
    id: number;
    userId: number;
    title: string;
    body: string;
};

export type TransactionType = {
    id: string;
    origDescription: string;
    olbTxnDate: string;
    qboAccountId: string;
    acceptType: string;
    creditCardPayment: boolean;
    transfer: boolean;
    amount: number;
    openBalance: number;
    olbTxnId: string;
    description: string;
    addAsQboTxn: {
        nameTypeId: number;
        createName: boolean;
        createAccount: boolean;
        txnTypeId: string;
        txnFdmName: string;
        currencyType: {
            isoCode: string;
            displayName: string;
            symbol: string;
        };
        details: {
            categoryId: string;
            billable: boolean;
        }[];
    };
    suggestionConfidence: string;
    linkedTxns: string[];
    mapOfAccounts: Record<string, string>;
    categorySource: string;
    categoryExplanation: string;
    payeeSource: string;
    payeeExplanation: string;
    categoryTaxGuidance: string;
    categoryAlternativeIds: string[];
    addMatchType: string;
    matchTransactionsMap: Record<string, string>;
    originalCategoryId: string;
    categoryConfidenceScore: number;
    userDeleted: boolean;
    olbAccountId: number;
    olbSessionId: number;
    catMerchantId: number;
    complexTransactionScore: number;
    lowContext: boolean;
    isHighConfidenceAdd: boolean;
    merchantNameMl: string;
    payeeWebsite: string;
    scheduleCId: string;
    complexTransaction: boolean;
};

export type TransactionType2 = {
    businessId: number;
    contextRequested: boolean;
    contextUserProvided: string | null;
    createdAt: string;
    currency: string;
    deletedAt: string | null;
    documentRequested: boolean;
    earliestPostedDate: string;
    externalUuid: string | null;
    id: number;
    isReimbursementClaim: boolean;
    itemType: string;
    latestPostedDate: string;
    matchedInvoice: number | null;
    matchedReceiptDocs: number[];
    pending: boolean;
    splits: TransactionSplit[];
    totalAmount: string;
    updatedAt: string;
};

export type TransactionSplit = {
    aiCatgFail: string | null;
    aiCounterpartyFail: string | null;
    amount: string;
    assetId: number | null;
    assetUnits: number | null;
    businessId: number;
    categorizationMethod: string;
    categoryAndGifi: CategoryAndGifi[];
    categoryId: number;
    categorySetAt: string | null;
    categorySetByUserId: number | null;
    counterpartyMethod: string | null;
    counterpartySetAt: string | null;
    createdAt: string;
    deletedAt: string | null;
    ecEventId: number;
    exchangeFromCurrency: string | null;
    exchangeRate: number | null;
    exchangeReciprocal: number | null;
    exchangeReciprocalId: number | null;
    exchangeToCurrency: string | null;
    freezeCategorizeTill: string | null;
    id: number;
    isSalesTax: boolean | null;
    isSalesTaxId: number | null;
    matchedInvoice: number | null;
    mergedIntoId: number | null;
    pendingTransfer: boolean;
    readyForAiCatg: boolean;
    readyForSimilarCatg: boolean;
    recipientAccountId: number | null;
    recipientDescription: string | null;
    recipientId: number;
    recipientPostedDate: string | null;
    refundOf: number | null;
    refundedBy: number | null;
    senderAccountId: number;
    senderDescription: string;
    senderId: number | null;
    senderPostedDate: string;
    updatedAt: string;
};

export type CategoryAndGifi = {
    businessId: number | null;
    createdAt: string;
    displayLabel?: string;
    gifiCode?: number;
    id: number;
    labelColor?: string;
    updatedAt: string;
    amortization?: number | null;
    applicableEntityType?: string;
    autoCatgList?: string;
    belongsToShortCode?: number;
    code?: number;
    description?: string;
    displayMore?: boolean;
    element?: string;
    ifrsOnly?: boolean | null;
    industry?: string;
    inventory?: boolean;
    name?: string;
    nonSingleTransactions?: boolean | null;
    quickHide?: boolean;
};
