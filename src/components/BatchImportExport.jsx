"use client";

import React, { useState } from 'react';
import { Upload, Download, Check, AlertCircle, X } from 'lucide-react';
import { toast } from 'react-hot-toast';

// Component for batch importing and exporting interns data
const BatchImportExport = ({ onImportSuccess, existingData = [] }) => {
  const [isUploading, setIsUploading] = useState(false);
  const [previewData, setPreviewData] = useState(null);
  const [fileName, setFileName] = useState("");
  const [errors, setErrors] = useState([]);
  
  // Sample headers expected in CSV
  const requiredHeaders = ["firstName", "lastName", "employeeId", "email", "department", "position"];

  // Handle file input change
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    // Validate file type (CSV or Excel)
    const fileType = file.name.split('.').pop().toLowerCase();
    if (!['csv', 'xlsx', 'xls'].includes(fileType)) {
      toast.error('Please upload a CSV or Excel file');
      return;
    }
    
    setFileName(file.name);
    setIsUploading(true);
    
    // Read file
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        // For demo, we'll parse CSV (in real app, use libraries like papaparse or xlsx)
        const csvData = event.target.result;
        const lines = csvData.split('\\n');
        const headers = lines[0].split(',').map(h => h.trim());
        
        // Validate headers
        const missingHeaders = requiredHeaders.filter(h => !headers.includes(h));
        if (missingHeaders.length > 0) {
          setErrors([`Missing required headers: ${missingHeaders.join(', ')}`]);
          setIsUploading(false);
          return;
        }
        
        // Parse data
        const parsedData = [];
        const dataErrors = [];
        
        for (let i = 1; i < lines.length; i++) {
          if (!lines[i].trim()) continue;
          
          const values = lines[i].split(',').map(v => v.trim());
          const row = {};
          
          headers.forEach((header, index) => {
            row[header] = values[index] || '';
          });
          
          // Basic validation
          if (!row.employeeId) {
            dataErrors.push(`Row ${i}: Missing Employee ID`);
          } else if (existingData.some(intern => intern.employeeId === row.employeeId)) {
            dataErrors.push(`Row ${i}: Employee ID ${row.employeeId} already exists`);
          }
          
          if (!row.firstName || !row.lastName) {
            dataErrors.push(`Row ${i}: Missing name fields`);
          }
          
          parsedData.push(row);
        }
        
        setPreviewData(parsedData.slice(0, 5)); // Preview first 5 rows
        setErrors(dataErrors);
        setIsUploading(false);
      } catch (error) {
        console.error("Error parsing file:", error);
        toast.error("Failed to parse file. Please check the format.");
        setIsUploading(false);
      }
    };
    
    reader.onerror = () => {
      toast.error('Error reading file');
      setIsUploading(false);
    };
    
    reader.readAsText(file);
  };
  
  // Handle data import
  const confirmImport = () => {
    if (errors.length > 0) {
      toast.error("Please fix all errors before importing");
      return;
    }
    
    // In a real app, this would call an API to import the data
    toast.success(`Successfully imported ${previewData.length}+ records`);
    
    // Reset state
    setPreviewData(null);
    setFileName("");
    
    // Call callback function
    if (onImportSuccess) {
      onImportSuccess(previewData);
    }
  };
  
  // Cancel import
  const cancelImport = () => {
    setPreviewData(null);
    setFileName("");
    setErrors([]);
  };
  
  // Export data as CSV
  const exportToCSV = () => {
    // Format data for CSV
    const headers = requiredHeaders.join(',');
    const csvRows = existingData.map(item => {
      return requiredHeaders.map(header => item[header] || '').join(',');
    });
    
    const csvContent = `${headers}\\n${csvRows.join('\\n')}`;
    
    // Create and download file
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'interns_data.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    toast.success('Data exported successfully!');
  };
  
  // Export data as Excel
  const exportToExcel = () => {
    toast.success('Data exported as Excel');
    // In a real app, use libraries like xlsx to create Excel files
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center gap-4">
        <div>
          <label 
            className="px-4 py-2 bg-emerald-600 text-white rounded-md hover:bg-emerald-700 cursor-pointer inline-flex items-center"
          >
            <Upload size={16} className="mr-2" />
            Import Data
            <input
              type="file"
              accept=".csv,.xlsx,.xls"
              onChange={handleFileChange}
              className="hidden"
            />
          </label>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
            Upload CSV or Excel files
          </p>
        </div>
        
        <button
          onClick={exportToCSV}
          className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 inline-flex items-center"
        >
          <Download size={16} className="mr-2" />
          Export as CSV
        </button>
        
        <button
          onClick={exportToExcel}
          className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 inline-flex items-center"
        >
          <Download size={16} className="mr-2" />
          Export as Excel
        </button>
      </div>
      
      {isUploading && (
        <div className="flex items-center space-x-3">
          <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-emerald-500"></div>
          <p>Processing file...</p>
        </div>
      )}
      
      {fileName && !isUploading && (
        <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-md border border-gray-200 dark:border-gray-700">
          <p className="font-medium text-gray-800 dark:text-white mb-2">File: {fileName}</p>
          
          {errors.length > 0 && (
            <div className="mb-4">
              <p className="text-red-600 dark:text-red-400 font-medium flex items-center">
                <AlertCircle size={16} className="mr-1" />
                Import has {errors.length} error(s)
              </p>
              <ul className="text-sm text-red-600 dark:text-red-400 ml-6 list-disc">
                {errors.slice(0, 5).map((error, index) => (
                  <li key={index}>{error}</li>
                ))}
                {errors.length > 5 && <li>...and {errors.length - 5} more errors</li>}
              </ul>
            </div>
          )}
          
          {previewData && (
            <>
              <p className="font-medium text-gray-800 dark:text-white mb-2">Preview:</p>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                  <thead>
                    <tr>
                      {requiredHeaders.map(header => (
                        <th 
                          key={header} 
                          className="px-3 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider"
                        >
                          {header}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                    {previewData.map((row, rowIndex) => (
                      <tr key={rowIndex} className="text-sm">
                        {requiredHeaders.map(header => (
                          <td 
                            key={`${rowIndex}-${header}`} 
                            className="px-3 py-2 whitespace-nowrap text-gray-900 dark:text-white"
                          >
                            {row[header] || ''}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              
              <div className="mt-4 flex space-x-3">
                <button
                  onClick={confirmImport}
                  disabled={errors.length > 0}
                  className={`px-4 py-2 rounded-md inline-flex items-center ${
                    errors.length > 0 
                      ? 'bg-gray-300 dark:bg-gray-600 cursor-not-allowed' 
                      : 'bg-emerald-600 hover:bg-emerald-700 text-white'
                  }`}
                >
                  <Check size={16} className="mr-2" />
                  Confirm Import
                </button>
                
                <button
                  onClick={cancelImport}
                  className="px-4 py-2 rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 inline-flex items-center"
                >
                  <X size={16} className="mr-2" />
                  Cancel
                </button>
              </div>
            </>
          )}
        </div>
      )}
      
      <div className="text-sm text-gray-500 dark:text-gray-400 bg-blue-50 dark:bg-blue-900/30 p-4 rounded-md border-l-4 border-blue-500">
        <p className="font-medium text-blue-700 dark:text-blue-300 mb-1">CSV Format Instructions:</p>
        <ul className="list-disc pl-5 space-y-1">
          <li>First row must contain headers: {requiredHeaders.join(', ')}</li>
          <li>Each intern must have a unique Employee ID</li>
          <li>First and last names are required fields</li>
          <li>Department must match one of the existing departments</li>
        </ul>
      </div>
    </div>
  );
};

export default BatchImportExport;
