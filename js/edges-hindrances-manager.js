/* Additional CSS for Enhanced Edges & Hindrances - Add to css/main.css */

/* Equal column widths fix */
.content-area {
    display: grid;
    grid-template-columns: 1fr 1fr; /* Equal widths */
    gap: 20px;
}

/* Column headers styling */
.column-header {
    font-weight: bold;
    font-size: 14px; /* Reduced by 1 point */
    color: #333;
    margin-bottom: 10px;
    padding: 8px 12px;
    background-color: #f8f9fa;
    border-radius: 4px;
    text-align: center;
    border: 1px solid #dee2e6;
}

/* Selected items styling - identical to available items */
.selected-item {
    background-color: #f8f9ff; /* Very light blue background */
    border: 1px solid #d1ecf1;
    margin-bottom: 8px;
    border-radius: 4px;
    transition: all 0.3s ease;
}

.selected-item:hover {
    background-color: #e2f3ff;
    border-color: #bee5eb;
}

/* Remove button styling */
.remove-btn {
    background: #dc3545;
    border: none;
    color: white;
    padding: 4px 8px;
    border-radius: 3px;
    cursor: pointer;
    font-size: 11px; /* Reduced by 1 point */
    margin-top: 8px;
    transition: all 0.3s ease;
}

.remove-btn:hover {
    background: #c82333;
    transform: scale(1.05);
}

.remove-btn:active {
    transform: scale(0.95);
}

/* Font size reductions throughout */
.checkbox-item .checkbox-title {
    font-size: 14px; /* Reduced from 15px */
    font-weight: bold;
}

.checkbox-item .checkbox-description {
    font-size: 12px; /* Reduced from 13px */
    color: #666;
    margin-top: 4px;
}

.checkbox-item .requirements {
    font-size: 11px; /* Reduced from 12px */
    color: #888;
    font-style: italic;
    margin-top: 4px;
}

.checkbox-item .type {
    font-size: 11px; /* Reduced from 12px */
    color: #666;
    margin-top: 4px;
}

/* Info bar styling improvements */
.hindrance-info-bar,
.edge-info-bar {
    font-size: 14px; /* Reduced by 1 point */
    font-weight: bold;
    color: #495057;
    margin-bottom: 15px;
    padding: 10px;
    background-color: #e9ecef;
    border-radius: 4px;
    text-align: center;
}

/* Section headers */
.hindrance-section-header,
.edge-section-header {
    font-size: 13px; /* Reduced by 1 point */
    font-weight: bold;
    color: #495057;
    margin: 15px 0 8px 0;
    padding: 6px 10px;
    background-color: #f1f3f4;
    border-radius: 3px;
}

/* Ensure selected panels are scrollable if needed */
.selected-hindrances-list,
.selected-edges-list {
    max-height: 400px;
    overflow-y: auto;
    padding: 10px;
    background-color: #fafafa;
    border-radius: 4px;
    border: 1px solid #e0e0e0;
}

/* Empty state styling */
.selected-hindrances-list:empty::after {
    content: "No hindrances selected";
    display: block;
    text-align: center;
    color: #999;
    font-style: italic;
    padding: 20px;
}

.selected-edges-list:empty::after {
    content: "No edges selected";
    display: block;
    text-align: center;
    color: #999;
    font-style: italic;
    padding: 20px;
}

/* Responsive adjustments */
@media (max-width: 768px) {
    .content-area {
        grid-template-columns: 1fr;
        gap: 15px;
    }
    
    .column-header {
        font-size: 13px;
    }
    
    .checkbox-item .checkbox-title {
        font-size: 13px;
    }
    
    .checkbox-item .checkbox-description {
        font-size: 11px;
    }
}
