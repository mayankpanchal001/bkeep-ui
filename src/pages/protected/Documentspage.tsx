import { useState } from 'react';
import {
    FaDownload,
    FaEye,
    FaFile,
    FaFileExcel,
    FaFileImage,
    FaFilePdf,
    FaFileWord,
    FaFilter,
    FaFolder,
    FaSearch,
    FaTrash,
    FaUpload,
} from 'react-icons/fa';
import Button from '../../components/typography/Button';
import { InputField } from '../../components/typography/InputFields';

type Document = {
    id: string;
    name: string;
    type: string;
    size: number;
    uploadedDate: string;
    category: string;
    uploadedBy: string;
};

const MOCK_DOCUMENTS: Document[] = [
    {
        id: '1',
        name: 'Invoice_2024_001.pdf',
        type: 'pdf',
        size: 245760,
        uploadedDate: '2024-01-15',
        category: 'Invoices',
        uploadedBy: 'John Doe',
    },
    {
        id: '2',
        name: 'Receipt_Office_Supplies.jpg',
        type: 'image',
        size: 1024000,
        uploadedDate: '2024-01-18',
        category: 'Receipts',
        uploadedBy: 'Jane Smith',
    },
    {
        id: '3',
        name: 'Financial_Report_Q1.xlsx',
        type: 'excel',
        size: 512000,
        uploadedDate: '2024-01-20',
        category: 'Reports',
        uploadedBy: 'John Doe',
    },
    {
        id: '4',
        name: 'Contract_Agreement.docx',
        type: 'word',
        size: 128000,
        uploadedDate: '2024-01-22',
        category: 'Contracts',
        uploadedBy: 'Jane Smith',
    },
];

const CATEGORIES = [
    'All',
    'Invoices',
    'Receipts',
    'Reports',
    'Contracts',
    'Tax Documents',
    'Other',
];

const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(2) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(2) + ' MB';
};

const getFileIcon = (type: string) => {
    switch (type) {
        case 'pdf':
            return <FaFilePdf className="w-6 h-6 text-red-600" />;
        case 'image':
            return <FaFileImage className="w-6 h-6 text-green-600" />;
        case 'excel':
            return <FaFileExcel className="w-6 h-6 text-green-700" />;
        case 'word':
            return <FaFileWord className="w-6 h-6 text-blue-600" />;
        default:
            return <FaFile className="w-6 h-6 text-primary-50" />;
    }
};

const Documentspage = () => {
    const [documents] = useState<Document[]>(MOCK_DOCUMENTS);
    const [searchQuery, setSearchQuery] = useState('');
    const [categoryFilter, setCategoryFilter] = useState<string>('All');
    const [isUploading, setIsUploading] = useState(false);
    const [dragActive, setDragActive] = useState(false);

    const filteredDocuments = documents.filter((doc) => {
        const matchesSearch = doc.name
            .toLowerCase()
            .includes(searchQuery.toLowerCase());
        const matchesCategory =
            categoryFilter === 'All' || doc.category === categoryFilter;
        return matchesSearch && matchesCategory;
    });

    const handleDrag = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        if (e.type === 'dragenter' || e.type === 'dragover') {
            setDragActive(true);
        } else if (e.type === 'dragleave') {
            setDragActive(false);
        }
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setDragActive(false);

        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
            handleFiles();
        }
    };

    const handleFiles = () => {
        setIsUploading(true);
        // Simulate file upload
        setTimeout(() => {
            setIsUploading(false);
            // Handle file upload logic here
        }, 2000);
    };

    const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            handleFiles();
        }
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                    <h2 className="text-2xl font-bold text-primary">
                        Documents
                    </h2>
                    <p className="text-sm text-primary-50 mt-1">
                        Upload and manage your documents
                    </p>
                </div>
                <div className="flex items-center gap-3">
                    <input
                        type="file"
                        id="file-upload"
                        multiple
                        onChange={handleFileInput}
                        className="hidden"
                    />
                    <label htmlFor="file-upload">
                        <Button
                            variant="primary"
                            className="flex items-center gap-2 cursor-pointer"
                        >
                            <FaUpload />
                            Upload Files
                        </Button>
                    </label>
                </div>
            </div>

            {/* Upload Area */}
            <div
                onDragEnter={handleDrag}
                onDragLeave={handleDrag}
                onDragOver={handleDrag}
                onDrop={handleDrop}
                className={`border-2 border-dashed rounded-xl p-12 text-center transition-colors ${
                    dragActive
                        ? 'border-primary bg-primary-10'
                        : 'border-primary-25 bg-primary-5'
                }`}
            >
                <FaUpload className="w-12 h-12 text-primary-50 mx-auto mb-4" />
                <p className="text-lg font-semibold text-primary mb-2">
                    Drag and drop files here
                </p>
                <p className="text-sm text-primary-50 mb-4">
                    or click the upload button above
                </p>
                <p className="text-xs text-primary-50">
                    Supported formats: PDF, Images, Excel, Word
                </p>
            </div>

            {/* Filters */}
            <div className="bg-white rounded-xl shadow-sm border border-primary-10 p-4">
                <div className="flex flex-col sm:flex-row gap-4">
                    <div className="flex-1">
                        <div className="relative">
                            <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-primary-50 w-4 h-4" />
                            <InputField
                                id="search-documents"
                                placeholder="Search documents..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        <FaFilter className="text-primary-50" />
                        <select
                            value={categoryFilter}
                            onChange={(e) => setCategoryFilter(e.target.value)}
                            className="px-4 py-2 border border-primary-10 rounded-xl text-sm text-primary focus:outline-none focus:border-primary"
                        >
                            {CATEGORIES.map((category) => (
                                <option key={category} value={category}>
                                    {category}
                                </option>
                            ))}
                        </select>
                    </div>
                </div>
            </div>

            {/* Documents Grid */}
            {isUploading && (
                <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 text-center">
                    <p className="text-blue-700 font-medium">
                        Uploading files...
                    </p>
                </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {filteredDocuments.length === 0 ? (
                    <div className="col-span-full text-center py-12 text-primary-50">
                        No documents found
                    </div>
                ) : (
                    filteredDocuments.map((doc) => (
                        <div
                            key={doc.id}
                            className="bg-white rounded-xl shadow-sm border border-primary-10 p-4 hover:shadow-md transition-shadow"
                        >
                            <div className="flex items-start justify-between mb-3">
                                <div className="flex items-center gap-3 flex-1 min-w-0">
                                    {getFileIcon(doc.type)}
                                    <div className="flex-1 min-w-0">
                                        <div className="font-medium text-primary truncate">
                                            {doc.name}
                                        </div>
                                        <div className="text-xs text-primary-50">
                                            {formatFileSize(doc.size)}
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div className="space-y-2 mb-3">
                                <div className="flex items-center gap-2 text-xs text-primary-50">
                                    <FaFolder className="w-3 h-3" />
                                    <span>{doc.category}</span>
                                </div>
                                <div className="text-xs text-primary-50">
                                    Uploaded:{' '}
                                    {new Date(
                                        doc.uploadedDate
                                    ).toLocaleDateString()}
                                </div>
                                <div className="text-xs text-primary-50">
                                    By: {doc.uploadedBy}
                                </div>
                            </div>
                            <div className="flex items-center gap-2 pt-3 border-t border-primary-10">
                                <button
                                    className="flex-1 px-3 py-2 text-xs font-medium text-primary bg-primary-10 rounded-lg hover:bg-primary-25 transition-colors"
                                    title="View"
                                >
                                    <FaEye className="w-3 h-3 mx-auto" />
                                </button>
                                <button
                                    className="flex-1 px-3 py-2 text-xs font-medium text-primary bg-primary-10 rounded-lg hover:bg-primary-25 transition-colors"
                                    title="Download"
                                >
                                    <FaDownload className="w-3 h-3 mx-auto" />
                                </button>
                                <button
                                    className="flex-1 px-3 py-2 text-xs font-medium text-red-600 bg-red-50 rounded-lg hover:bg-red-100 transition-colors"
                                    title="Delete"
                                >
                                    <FaTrash className="w-3 h-3 mx-auto" />
                                </button>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};

export default Documentspage;
