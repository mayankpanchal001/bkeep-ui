import { Loader2 } from 'lucide-react';
import { useRef, useState } from 'react';
import { FaCloudUploadAlt, FaFileExcel } from 'react-icons/fa';
import * as XLSX from 'xlsx';
import { useCreateContact } from '../../services/apis/contactsApi';
import { showErrorToast, showSuccessToast } from '../../utills/toast';
import Popup from '../shared/Popup';
import { Button } from '../ui/button';

interface ImportContactsModalProps {
    isOpen: boolean;
    onClose: () => void;
}

const ImportContactsModal = ({
    isOpen,
    onClose,
}: ImportContactsModalProps) => {
    const [dragActive, setDragActive] = useState(false);
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [isProcessing, setIsProcessing] = useState(false);
    const inputRef = useRef<HTMLInputElement>(null);

    const { mutateAsync: createContact } = useCreateContact();

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
            handleFile(e.dataTransfer.files[0]);
        }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        e.preventDefault();
        if (e.target.files && e.target.files[0]) {
            handleFile(e.target.files[0]);
        }
    };

    const handleFile = (file: File) => {
        if (
            file.type ===
            'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' ||
            file.type === 'application/vnd.ms-excel' ||
            file.name.endsWith('.xlsx') ||
            file.name.endsWith('.xls') ||
            file.name.endsWith('.csv')
        ) {
            setSelectedFile(file);
        } else {
            showErrorToast('Invalid file type. Please upload Excel or CSV.');
        }
    };

    const processFile = async () => {
        if (!selectedFile) return;

        setIsProcessing(true);
        const reader = new FileReader();

        reader.onload = async (e) => {
            try {
                const data = e.target?.result;
                const workbook = XLSX.read(data, { type: 'binary' });
                const firstSheetName = workbook.SheetNames[0];
                const worksheet = workbook.Sheets[firstSheetName];
                const jsonData = XLSX.utils.sheet_to_json(worksheet, {
                    raw: false,
                });

                if (jsonData.length === 0) {
                    showErrorToast('File is empty or could not be parsed.');
                    setIsProcessing(false);
                    return;
                }

                let successCount = 0;
                let errorCount = 0;

                // Simple mapping strategy: Look for keys that contain common contact fields
                for (const row of jsonData as Array<Record<string, unknown>>) {
                    // Normalize keys to lowercase for looser matching
                    const normalizedRow: Record<string, unknown> = {};
                    Object.keys(row).forEach((key) => {
                        normalizedRow[key.toLowerCase()] = row[key];
                    });

                    // Extract fields
                    const displayNameRaw =
                        normalizedRow['displayname'] ||
                        normalizedRow['display name'] ||
                        normalizedRow['name'] ||
                        normalizedRow['contact name'];
                    const typeRaw =
                        normalizedRow['type'] ||
                        normalizedRow['contact type'] ||
                        normalizedRow['contacttype'];
                    const emailRaw =
                        normalizedRow['email'] ||
                        normalizedRow['email address'];
                    const firstNameRaw =
                        normalizedRow['firstname'] ||
                        normalizedRow['first name'];
                    const lastNameRaw =
                        normalizedRow['lastname'] ||
                        normalizedRow['last name'];
                    const companyNameRaw =
                        normalizedRow['companyname'] ||
                        normalizedRow['company name'] ||
                        normalizedRow['company'];
                    const phoneNumberRaw =
                        normalizedRow['phonenumber'] ||
                        normalizedRow['phone number'] ||
                        normalizedRow['phone'] ||
                        normalizedRow['mobile'];
                    const openingBalanceRaw =
                        normalizedRow['openingbalance'] ||
                        normalizedRow['opening balance'] ||
                        normalizedRow['balance'];

                    const displayName = displayNameRaw
                        ? String(displayNameRaw)
                        : '';
                    const type = typeRaw ? String(typeRaw).toLowerCase() : '';
                    const email = emailRaw ? String(emailRaw) : undefined;
                    const firstName = firstNameRaw
                        ? String(firstNameRaw)
                        : undefined;
                    const lastName = lastNameRaw
                        ? String(lastNameRaw)
                        : undefined;
                    const companyName = companyNameRaw
                        ? String(companyNameRaw)
                        : undefined;
                    const phoneNumber = phoneNumberRaw
                        ? String(phoneNumberRaw)
                        : undefined;
                    const openingBalance = openingBalanceRaw
                        ? parseFloat(String(openingBalanceRaw))
                        : undefined;

                    // Validate required fields
                    if (!displayName) {
                        console.warn(
                            'Skipping row - missing displayName:',
                            row
                        );
                        errorCount++;
                        continue;
                    }

                    // Validate and normalize type
                    let contactType: 'customer' | 'supplier' = 'customer';
                    if (
                        type === 'supplier' ||
                        type === 'vendor' ||
                        type === 'supplier'
                    ) {
                        contactType = 'supplier';
                    } else if (type === 'customer' || type === 'client') {
                        contactType = 'customer';
                    } else if (type && type !== 'customer') {
                        console.warn(`Unknown contact type "${type}", defaulting to customer`);
                    }

                    // Construct Payload
                    try {
                        await createContact({
                            displayName,
                            type: contactType,
                            email,
                            firstName,
                            lastName,
                            companyName,
                            phoneNumber,
                            openingBalance,
                        });
                        successCount++;
                    } catch (err) {
                        console.error('Failed to create contact:', err);
                        errorCount++;
                    }
                }

                if (successCount > 0) {
                    showSuccessToast(
                        `Successfully imported ${successCount} contact(s).`
                    );
                    handleClose();
                } else {
                    showErrorToast(
                        `Failed to import contacts. ${errorCount} error(s).`
                    );
                }
            } catch (error) {
                console.error('Error parsing file:', error);
                showErrorToast('Error parsing file.');
            } finally {
                setIsProcessing(false);
            }
        };

        reader.readAsBinaryString(selectedFile);
    };

    const handleClose = () => {
        setSelectedFile(null);
        setIsProcessing(false);
        onClose();
    };

    return (
        <Popup
            isOpen={isOpen}
            onClose={handleClose}
            title="Import Contacts"
            size="md"
            footer={
                <div className="flex justify-end items-center w-full gap-2">
                    <Button
                        variant="outline"
                        onClick={handleClose}
                        disabled={isProcessing}
                    >
                        Cancel
                    </Button>
                    <Button
                        variant="default"
                        onClick={processFile}
                        disabled={!selectedFile || isProcessing}
                    >
                        {isProcessing ? (
                            <>
                                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                Importing...
                            </>
                        ) : (
                            'Import'
                        )}
                    </Button>
                </div>
            }
        >
            <div className="space-y-6">
                <div className="flex flex-col gap-2">
                    <label className="text-sm font-medium text-gray-700">
                        Upload File
                    </label>
                    <div
                        className={`relative flex flex-col items-center justify-center w-full h-40 border-2 border-dashed rounded-lg transition-colors cursor-pointer
                            ${dragActive
                                ? 'border-primary bg-primary/5'
                                : 'border-gray-300 hover:border-primary/50 hover:bg-gray-50'
                            }
                            ${selectedFile ? 'bg-primary/5 border-primary' : ''}
                        `}
                        onDragEnter={handleDrag}
                        onDragLeave={handleDrag}
                        onDragOver={handleDrag}
                        onDrop={handleDrop}
                        onClick={() => inputRef.current?.click()}
                    >
                        <input
                            ref={inputRef}
                            type="file"
                            className="hidden"
                            accept=".xlsx,.xls,.csv"
                            onChange={handleChange}
                        />

                        {selectedFile ? (
                            <div className="text-center">
                                <FaFileExcel className="w-8 h-8 text-secondary mx-auto mb-2" />
                                <p className="text-sm font-medium text-gray-900">
                                    {selectedFile.name}
                                </p>
                                <p className="text-xs text-gray-500 mt-1">
                                    {(selectedFile.size / 1024).toFixed(2)} KB
                                </p>
                                <Button
                                    size="sm"
                                    variant="outline"
                                    className="mt-2 text-red-600 hover:text-red-700 hover:bg-red-50 h-auto py-1 px-2"
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        setSelectedFile(null);
                                        if (inputRef.current)
                                            inputRef.current.value = '';
                                    }}
                                >
                                    Remove
                                </Button>
                            </div>
                        ) : (
                            <div className="text-center p-4">
                                <FaCloudUploadAlt className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                                <p className="text-sm font-medium text-gray-700">
                                    <span className="text-primary hover:underline">
                                        Click to upload
                                    </span>{' '}
                                    or drag and drop
                                </p>
                                <p className="text-xs text-gray-500 mt-1">
                                    Supports Excel (.xlsx) and CSV (.csv)
                                </p>
                                <p className="text-xs text-gray-400 mt-2 italic">
                                    Expected columns: Display Name, Type (customer/supplier), Email, Phone
                                </p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </Popup>
    );
};

export default ImportContactsModal;
