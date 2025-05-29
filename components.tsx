

import React, { useState, useEffect, useRef, useCallback, ChangeEvent } from 'react';
import { Client, ReportPageData, Module, ModuleType, IconPickerTarget, ImageItem, ModuleDataMap, ParticipationModuleData, ParticipationGroupItem } from './types'; 
import { AVAILABLE_CLIENTS, generateUniqueId, getModuleName, getModuleIconName, MATERIAL_ICONS } from './constants';
import { InfoGridModule, ParticipationModule, JornadaFormativaModule, AspectosClaveModule, DesafiosOportunidadesModule, CierreConclusionModule, EvidenciaVisualModule, RichTextModule, BulletListModule, ModuleWrapper } from './modules';

// MaterialIcon Component
interface MaterialIconProps {
  name: string;
  className?: string;
  size?: string;
  color?: string;
  onClick?: () => void;
  style?: React.CSSProperties;
}
export const MaterialIcon: React.FC<MaterialIconProps> = ({ name, className = '', size, color, onClick, style = {} }) => {
  const combinedStyle: React.CSSProperties = {...style};
  if (size && !className.includes('text-')) {
    if (/^\d/.test(size) || size.includes('rem') || size.includes('em') || size.includes('px')) {
        combinedStyle.fontSize = size;
    }
  }
  if (color && !color.startsWith('text-') && !color.startsWith('bg-') && !color.startsWith('var(')) {
    combinedStyle.color = color;
  }

  return (
    <span
      className={`material-icons-round align-middle ${size && !combinedStyle.fontSize ? size : ''} ${color && !combinedStyle.color && !color.startsWith('var(') ? color : ''} ${className}`}
      style={combinedStyle}
      onClick={onClick}
      aria-hidden="true"
    >
      {name}
    </span>
  );
};


// EditableField Component
interface EditableFieldProps {
  html: string;
  onChange: (newHtml: string) => void;
  placeholder?: string;
  className?: string; 
  tagName?: keyof React.JSX.IntrinsicElements;
  style?: React.CSSProperties;
  color?: string;
  suppressToolbar?: boolean;
  containerClassName?: string; 
  id?: string; 
  isProse?: boolean; 
}

export const EditableField: React.FC<EditableFieldProps> = ({
    html,
    onChange,
    placeholder,
    className,
    tagName = 'div',
    style,
    color,
    containerClassName,
    id,
    isProse = false
}) => {
    const ref = useRef<HTMLElement>(null);
    const isFocused = useRef(false);
    const lastCommittedHtml = useRef(html);

    useEffect(() => {
        if (ref.current && !isFocused.current && ref.current.innerHTML !== html) {
            ref.current.innerHTML = html;
            lastCommittedHtml.current = html;
        }
        else if (ref.current && !isFocused.current && ref.current.innerHTML === html && lastCommittedHtml.current !== html) {
             lastCommittedHtml.current = html;
        }
    }, [html]);


    useEffect(() => {
        if (ref.current && ref.current.innerHTML !== html) {
            ref.current.innerHTML = html;
            lastCommittedHtml.current = html;
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []); 


    const handleInput = (event: React.FormEvent<HTMLElement>) => {
        const currentDOMHtml = event.currentTarget.innerHTML;
        if (lastCommittedHtml.current !== currentDOMHtml) {
            lastCommittedHtml.current = currentDOMHtml; 
            onChange(currentDOMHtml);
        }
    };

    const handleFocus = () => {
        isFocused.current = true;
    };

    const handleBlur = () => {
        isFocused.current = false;
        if (ref.current && ref.current.innerHTML !== html) {
            onChange(ref.current.innerHTML);
            lastCommittedHtml.current = ref.current.innerHTML;
        } else if (ref.current && ref.current.innerHTML === html) {
            lastCommittedHtml.current = html;
        }
    };

    const Tag = tagName as any;
    const dynamicStyles = { ...style, color: color || 'var(--client-readable-text-override, inherit)' };
    const wrapperDivClassName = `group/editable-item relative ${containerClassName === undefined ? 'w-full' : containerClassName}`;
    
    const fieldClassName = `editable-field focus:outline-none focus:ring-2 focus:ring-[var(--client-highlight-text)] hover:bg-gray-100/50 dark:hover:bg-gray-700/50 p-1 rounded min-h-[1em] ${isProse ? 'prose dark:prose-invert max-w-none' : ''} ${className}`;


    return (
        <div className={wrapperDivClassName}>
            <Tag
                ref={ref}
                id={id} 
                className={fieldClassName}
                contentEditable
                suppressContentEditableWarning={true}
                onInput={handleInput}
                onFocus={handleFocus}
                onBlur={handleBlur}
                placeholder={placeholder}
                style={dynamicStyles}
                role="textbox"
                aria-multiline={tagName !== 'input' && tagName !== 'span'}
            />
        </div>
    );
};


// ControlsPanel Component
interface ControlsPanelProps {
  clients: Client[];
  selectedClientLogoUrl: string;
  onClientChange: (newLogoUrl: string) => void;
  onAddPage: () => void;
  onExportPdf: () => void;
  onExportPng: () => void;
  onImportDocument: (event: ChangeEvent<HTMLInputElement>) => void;
}
export const ControlsPanel: React.FC<ControlsPanelProps> = ({ 
    clients, selectedClientLogoUrl, onClientChange, 
    onAddPage, onExportPdf, onExportPng, onImportDocument 
}) => {
  const importFileInputRef = useRef<HTMLInputElement>(null);
  const exportButtonRef = useRef<HTMLDivElement>(null);
  const [showExportOptions, setShowExportOptions] = useState(false);

  const handleImportClick = () => {
    importFileInputRef.current?.click();
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
        if (exportButtonRef.current && !exportButtonRef.current.contains(event.target as Node)) {
            setShowExportOptions(false);
        }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);


  return (
    <div className="controls-panel bg-white dark:bg-gray-800 p-4 sm:p-6 rounded-lg shadow-md mb-8 flex flex-wrap gap-3 justify-center items-center sticky top-4 z-[1000] print:hidden">
      <button
        onClick={onAddPage}
        className="action-button bg-teal-600 hover:bg-teal-700 text-white font-semibold py-3 px-6 rounded-lg shadow-sm flex items-center gap-2 text-sm transition-colors"
        title="Añadir nueva página al informe"
      >
        <MaterialIcon name="add_circle_outline" /> Añadir Página
      </button>
      
      <div ref={exportButtonRef} className="relative inline-block text-left">
        <button
            onClick={() => setShowExportOptions(!showExportOptions)}
            className="action-button bg-teal-600 hover:bg-teal-700 text-white font-semibold py-3 px-6 rounded-lg shadow-sm flex items-center gap-2 text-sm transition-colors"
            title="Opciones de exportación"
            aria-haspopup="true"
            aria-expanded={showExportOptions}
        >
            <MaterialIcon name="save_alt" /> Exportar Como...
            <MaterialIcon name={showExportOptions ? "expand_less" : "expand_more"} />
        </button>
        {showExportOptions && (
            <div 
              className="origin-top-right absolute right-0 mt-2 w-56 rounded-md shadow-lg bg-white dark:bg-gray-800 ring-1 ring-black dark:ring-gray-700 ring-opacity-5 focus:outline-none z-50"
              role="menu" 
              aria-orientation="vertical" 
              aria-labelledby="export-options-menu"
            >
            <div className="py-1" role="none">
                <button
                onClick={() => { onExportPdf(); setShowExportOptions(false); }}
                className="flex items-center w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700"
                role="menuitem"
                >
                <MaterialIcon name="picture_as_pdf" className="mr-3" /> Exportar como PDF
                </button>
                <button
                onClick={() => { onExportPng(); setShowExportOptions(false); }}
                className="flex items-center w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700"
                role="menuitem"
                >
                <MaterialIcon name="image" className="mr-3" /> Exportar como PNG
                </button>
            </div>
            </div>
        )}
      </div>

       <input
        type="file"
        ref={importFileInputRef}
        className="hidden"
        accept=".docx,.pdf"
        onChange={onImportDocument}
        aria-hidden="true"
      />
      <button
        onClick={handleImportClick}
        className="action-button bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-lg shadow-sm flex items-center gap-2 text-sm transition-colors"
        title="Importar datos desde DOCX o PDF"
      >
        <MaterialIcon name="file_upload" /> Importar Documento
      </button>
      {AVAILABLE_CLIENTS.length > 0 && (
        <div className="flex items-center gap-2">
          <label htmlFor="clientSelect" className="text-sm font-medium text-gray-700 dark:text-gray-300">Cliente:</label>
          <select
            id="clientSelect"
            value={selectedClientLogoUrl}
            onChange={(e) => onClientChange(e.target.value)}
            className="client-select bg-white dark:bg-gray-700 dark:text-white border border-gray-300 dark:border-gray-600 text-gray-900 text-sm rounded-lg p-2.5 h-[46px] min-w-[150px] focus:border-teal-500 focus:ring-2 focus:ring-teal-200 dark:focus:border-teal-400"
            title="Seleccionar logo del cliente para el informe"
          >
            {clients.map(client => (
              <option key={client.id} value={client.logoUrl}>{client.name}</option>
            ))}
          </select>
        </div>
      )}
    </div>
  );
};

// ReportLogoImage Component
interface ReportLogoImageProps {
  src: string;
  alt: string;
  containerClasses?: string;
  baseImageClasses?: string;
  placeholderClasses?: string;
  placeholderText?: string;
  exportId?: string; 
}

export const ReportLogoImage: React.FC<ReportLogoImageProps> = ({
  src,
  alt,
  containerClasses = "max-h-10 max-w-[180px]",
  baseImageClasses = "h-auto w-auto max-h-full max-w-full object-contain",
  placeholderClasses = "bg-gray-100/80 dark:bg-gray-700/80 border border-dashed border-gray-300 dark:border-gray-600",
  placeholderText = "Logo",
  exportId,
}) => {
  const [hasError, setHasError] = useState(false);
  const [currentSrc, setCurrentSrc] = useState(src);

  useEffect(() => {
    // Reset error state and update src if the prop changes
    if (src !== currentSrc) {
        setHasError(false);
        setCurrentSrc(src);
    }
  }, [src, currentSrc]);

  const handleError = () => {
    setHasError(true);
  };

  if (!src) { // If src is empty or null, show placeholder directly
    return (
      <div
        className={`${containerClasses} ${placeholderClasses} flex items-center justify-center text-gray-500 dark:text-gray-400 text-xs p-2 rounded aspect-video`}
        aria-label={`${alt} - Sin imagen`}
        {...(exportId ? { id: exportId } : {})}
      >
        <MaterialIcon name="image_not_supported" className="mr-1 text-lg" /> {placeholderText}
      </div>
    );
  }

  if (hasError) {
    return (
      <div
        className={`${containerClasses} ${placeholderClasses} flex items-center justify-center text-gray-500 dark:text-gray-400 text-xs p-2 rounded aspect-video`}
        aria-label={`${alt} - Error de carga`}
        {...(exportId ? { id: exportId } : {})}
      >
        <MaterialIcon name="broken_image" className="mr-1 text-lg" /> {placeholderText}
      </div>
    );
  }

  return (
    <div className={`${containerClasses} flex items-center justify-center`} {...(exportId ? { id: exportId } : {})}>
      <img
        src={currentSrc}
        alt={alt}
        className={baseImageClasses}
        onError={handleError}
        crossOrigin="anonymous" // Attempt to enable CORS for html2canvas
      />
    </div>
  );
};


// ReportPageDisplay Component
interface ReportPageDisplayProps {
  pageData: ReportPageData;
  pageIndex: number;
  totalPages: number;
  onDeletePage: (pageId: string) => void;
  onUpdatePageData: <K extends keyof ReportPageData>(pageIndex: number, field: K, value: ReportPageData[K]) => void;
  onDeleteModule: (pageIndex: number, moduleIndex: number) => void;
  onDuplicateModule: (pageIndex: number, moduleIndex: number) => void;
  onAddModule: (pageIndex: number, moduleType: ModuleType, insertAtIndex: number) => void;
  
  // InfoGrid specific handlers
  onAddFieldToInfoGrid?: (pageIndex: number, moduleIndex: number) => void;
  onDeleteItemFromInfoGrid?: (pageIndex: number, moduleIndex: number, itemIndex: number) => void;
  // JornadaFormativa specific handlers
  onAddPointToJornadaFormativa?: (pageIndex: number, moduleIndex: number) => void;
  onDeleteItemFromJornadaFormativa?: (pageIndex: number, moduleIndex: number, itemIndex: number) => void;
  // AspectosClave specific handlers
  onAddAspectoClave?: (pageIndex: number, moduleIndex: number) => void;
  onDeleteItemFromAspectosClave?: (pageIndex: number, moduleIndex: number, itemIndex: number) => void;
  // DesafiosOportunidades specific handlers
  onAddDesafioOportunidad?: (pageIndex: number, moduleIndex: number) => void;
  onDeleteItemFromDesafiosOportunidades?: (pageIndex: number, moduleIndex: number, itemIndex: number) => void;
  // BulletList specific handlers
  onAddBulletListItem?: (pageIndex: number, moduleIndex: number) => void;
  onDeleteBulletListItem?: (pageIndex: number, moduleIndex: number, itemIndex: number) => void;

  // Participation module specific handlers
  onAddParticipationGroup: (pageIndex: number, moduleIndex: number) => void;
  onDeleteParticipationGroup: (pageIndex: number, moduleIndex: number, groupIndex: number) => void;
  onAddMetricToGroup: (pageIndex: number, moduleIndex: number, groupIndex: number) => void;
  onDeleteMetricFromGroup: (pageIndex: number, moduleIndex: number, groupIndex: number, statIndex: number) => void;
  
  // Evidencia Visual specific handler
  onAddImageToEvidenciaVisualModule?: (pageIndex: number, moduleIndex: number) => void;

  onOpenIconPicker: (target: IconPickerTarget) => void;
  setDeepValueInState: (pageIndex: number, path: string, value: any) => void;
  activeModuleMenuId: string | null;
  setActiveModuleMenuId: (id: string | null) => void;
  activeAddModuleMenu: string | null;
  setActiveAddModuleMenu: (id: string | null) => void;
  maxStatsParticipation: number;
}
export const ReportPageDisplay: React.FC<ReportPageDisplayProps> = (props) => {
  const {
    pageData, pageIndex, totalPages, onDeletePage,
    onUpdatePageData, onDeleteModule, onDuplicateModule, onAddModule,
    onAddFieldToInfoGrid, onDeleteItemFromInfoGrid,
    onAddPointToJornadaFormativa, onDeleteItemFromJornadaFormativa,
    onAddAspectoClave, onDeleteItemFromAspectosClave,
    onAddDesafioOportunidad, onDeleteItemFromDesafiosOportunidades,
    onAddBulletListItem, onDeleteBulletListItem,
    onAddParticipationGroup, onDeleteParticipationGroup, onAddMetricToGroup, onDeleteMetricFromGroup,
    onAddImageToEvidenciaVisualModule,
    onOpenIconPicker, setDeepValueInState,
    activeModuleMenuId, setActiveModuleMenuId, activeAddModuleMenu, setActiveAddModuleMenu,
    maxStatsParticipation
  } = props;

  const currentClient = AVAILABLE_CLIENTS.find(c => c.logoUrl === pageData.clientLogoUrl) || (AVAILABLE_CLIENTS.length > 0 ? AVAILABLE_CLIENTS[0] : null);
  const clientColors = currentClient ? currentClient.colors : { /* Provide some default colors if currentClient is null */
    primary: '#CCCCCC', primaryDark: '#AAAAAA', primaryLight: '#DDDDDD', primaryExtraLight: '#F0F0F0',
    textOnPrimary: '#000000', textOnPrimaryLight: '#000000', textOnPrimaryExtraLight: '#000000',
    bodyText: '#333333', baseBrandColor: '#CCCCCC', highlightText: '#AAAAAA', readableTextOverride: '#000000'
  };


  const pageStyles: React.CSSProperties = {
    '--client-primary': clientColors.primary,
    '--client-primary-dark': clientColors.primaryDark,
    '--client-primary-light': clientColors.primaryLight,
    '--client-primary-extra-light': clientColors.primaryExtraLight,
    '--client-text-on-primary': clientColors.textOnPrimary,
    '--client-text-on-primary-light': clientColors.textOnPrimaryLight,
    '--client-text-on-primary-extra-light': clientColors.textOnPrimaryExtraLight,
    '--client-body-text': clientColors.bodyText,
    '--client-highlight-text': clientColors.highlightText,
    '--client-base-brand-color': clientColors.baseBrandColor,
    '--client-readable-text-override': clientColors.readableTextOverride,
  } as React.CSSProperties;
  
  const clientStyling = (() => {
    const baseStyles = {
        divClasses: "max-h-[32px] print:max-h-[28px] w-auto max-w-[170px] print:max-w-[150px]",
        imgClasses: "h-full w-auto object-contain"
    };
    if (currentClient) {
        if (currentClient.id === 'walmart') { 
            return {
                divClasses: "max-h-[40px] print:max-h-[32px] w-auto max-w-[200px] print:max-w-[180px]",
                imgClasses: "h-full w-auto object-contain"
            };
        }
        if (currentClient.id === 'cruz-verde') {
            return {
                divClasses: "w-[75px] h-[61.29px] print:w-[75px] print:h-[61.29px]",
                imgClasses: "h-full w-full object-contain"
            };
        }
    }
    return baseStyles;
  })();

  const logoDebugPlaceholderClasses = "bg-gray-100/80 dark:bg-gray-800/50 border border-dashed border-gray-300 dark:border-gray-600";
  const xpClientInfo = AVAILABLE_CLIENTS.find(c => c.id === 'xp');
  
  return (
    <div
        className="report-page bg-white dark:bg-gray-800 shadow-xl print:shadow-none w-[1065px] min-h-[1420px] p-[50px_60px] print:p-[40px_50px] print:w-full print:h-full print:border print:border-gray-200 relative flex flex-col"
        id={`page-${pageData.id}`}
        style={pageStyles}
    >
      <header className="mb-6 print:mb-4 flex flex-col">
        {/* Logos Row */}
        <div 
          className="flex justify-between items-center min-h-[40px] print:min-h-[32px]"
          style={{ marginBottom: '1rem' }} // Space between logos and title line
        >
          {/* Client Logo Wrapper (Left) */}
          <div className={`flex-shrink-0 ${clientStyling.divClasses}`}>
            {pageData.clientLogoUrl && currentClient && (
              <ReportLogoImage
                src={pageData.clientLogoUrl}
                alt={`${currentClient.name} Logo`}
                containerClasses={`${clientStyling.divClasses} client-logo-container`}
                baseImageClasses={clientStyling.imgClasses}
                placeholderClasses={logoDebugPlaceholderClasses}
                placeholderText={`${currentClient.name}`}
                exportId={`client-logo-${pageData.id}`}
              />
            )}
          </div>

          {/* XP Logo (Right, conditional) */}
          <div className="flex-shrink-0 ml-auto">
            {currentClient && currentClient.id !== 'xp' && xpClientInfo && (
              <ReportLogoImage
                src={xpClientInfo.logoUrl}
                alt={xpClientInfo.name + " Logo"}
                containerClasses="max-h-10 max-w-[180px] print:max-h-[28px] print:max-w-[150px]" // Default sizing for secondary logo
                baseImageClasses="h-full w-auto object-contain"
                placeholderClasses={logoDebugPlaceholderClasses}
                placeholderText={xpClientInfo.name}
                exportId={`xp-secondary-logo-${pageData.id}`}
              />
            )}
          </div>
        </div>

        {/* Title Row - centered below logos */}
        <div 
          className="report-title-container w-full text-center"
          style={{ 
            borderTop: '1px solid var(--client-primary-extra-light)', 
            paddingTop: '0.75rem', 
            marginTop: '0.5rem' 
          }}
        >
          <EditableField
            tagName="h1"
            html={pageData.reportTitle}
            onChange={(newHtml) => onUpdatePageData(pageIndex, 'reportTitle', newHtml)}
            className="text-3xl print:text-[22pt] font-bold tracking-tight dark:text-gray-100 w-full leading-tight"
            color={'var(--client-highlight-text)'}
            suppressToolbar={true}
          />
        </div>
      </header>


      {pageData.modules.length === 0 && (
                 <div className="w-full mx-auto my-4 print:hidden relative"> 
                    <AddModuleButtonPlacement 
                        pageIndex={pageIndex} 
                        moduleIndex={0} 
                        onAddModule={onAddModule}
                        activeAddModuleMenu={activeAddModuleMenu}
                        setActiveAddModuleMenu={setActiveAddModuleMenu} 
                    />
                </div>
            )}

      {pageData.modules.map((moduleData, moduleIdx) => (
        <React.Fragment key={moduleData.id}>
          <ModuleWrapper
            module={moduleData}
            pageIndex={pageIndex}
            moduleIndex={moduleIdx}
            onDeleteModule={onDeleteModule}
            onDuplicateModule={onDuplicateModule}
            
            onAddFieldToInfoGrid={onAddFieldToInfoGrid}
            onDeleteItemFromInfoGrid={onDeleteItemFromInfoGrid}
            onAddPointToJornadaFormativa={onAddPointToJornadaFormativa}
            onDeleteItemFromJornadaFormativa={onDeleteItemFromJornadaFormativa}
            onAddAspectoClave={onAddAspectoClave}
            onDeleteItemFromAspectosClave={onDeleteItemFromAspectosClave}
            onAddDesafioOportunidad={onAddDesafioOportunidad}
            onDeleteItemFromDesafiosOportunidades={onDeleteItemFromDesafiosOportunidades}
            onAddBulletListItem={onAddBulletListItem}
            onDeleteBulletListItem={onDeleteBulletListItem}

            onAddParticipationGroup={onAddParticipationGroup}
            onDeleteParticipationGroup={onDeleteParticipationGroup}
            onAddMetricToGroup={onAddMetricToGroup}
            onDeleteMetricFromGroup={onDeleteMetricFromGroup}
            onAddImageToEvidenciaVisualModule={onAddImageToEvidenciaVisualModule}

            maxStatsParticipation={maxStatsParticipation}
            onOpenIconPicker={onOpenIconPicker}
            setDeepValueInState={setDeepValueInState}
            activeModuleMenuId={activeModuleMenuId}
            setActiveModuleMenuId={setActiveModuleMenuId}
          />
          <AddModuleButtonPlacement
            pageIndex={pageIndex}
            moduleIndex={moduleIdx + 1}
            onAddModule={onAddModule}
            activeAddModuleMenu={activeAddModuleMenu}
            setActiveAddModuleMenu={setActiveAddModuleMenu}
          />
        </React.Fragment>
      ))}


      {totalPages > 1 && (
        <button
          className="delete-page-btn print:hidden absolute top-3 right-3 bg-red-500 text-white rounded-full w-8 h-8 flex items-center justify-center shadow-sm opacity-50 hover:opacity-100 hover:bg-red-600 transition-opacity"
          title="Eliminar esta página"
          onClick={() => onDeletePage(pageData.id)}
          aria-label="Eliminar esta página"
        >
          <MaterialIcon name="delete_outline" size="text-xl" />
        </button>
      )}
    </div>
  );
};

// AddModuleButton & Placement
interface AddModuleButtonPlacementProps {
    pageIndex: number;
    moduleIndex: number;
    onAddModule: (pageIndex: number, moduleType: ModuleType, insertAtIndex: number) => void;
    activeAddModuleMenu: string | null;
    setActiveAddModuleMenu: (id: string | null) => void;
}

export const AddModuleButtonPlacement: React.FC<AddModuleButtonPlacementProps> = ({ pageIndex, moduleIndex, onAddModule, activeAddModuleMenu, setActiveAddModuleMenu }) => {
    const buttonId = `add-module-${pageIndex}-${moduleIndex}`;
    const isOpen = activeAddModuleMenu === buttonId;

    const toggleMenu = (e: React.MouseEvent) => {
        e.stopPropagation();
        setActiveAddModuleMenu(isOpen ? null : buttonId);
    };

    const handleAdd = (type: ModuleType) => {
        onAddModule(pageIndex, type, moduleIndex);
        setActiveAddModuleMenu(null);
    };
    
    // Constants for positioning:
    // Button width is 32px (w-8).
    // Desired gap from page edge to button's outer edge: 10px.
    // Button's left position relative to container (which aligns with page border): -(button_width + gap) = -(32px + 10px) = -42px.
    const buttonLeftPosition = '-42px'; 
    // Menu starts next to button's right edge + small gap (4px)
    // Button's right edge is at -42px (button left) + 32px (button width) = -10px from page border.
    // Menu left position: -10px (button right edge) + 4px (gap) = -6px from page border.
    const menuLeftPosition = '-6px';

    return (
        <div
            className="add-module-button-placement-container h-10 print:hidden relative group"
            data-add-module-button-id={buttonId}
            style={{ width: 'calc(100% + 120px)', left: '-60px' }} // Container aligns with page border & spans its width+padding
        >
            <div
                className="absolute top-1/2 left-0 right-0 h-0.5 bg-transparent group-hover:bg-teal-400 dark:group-hover:bg-teal-500 transition-colors duration-150 transform -translate-y-1/2 z-10"
                aria-hidden="true"
                 style={{ left: '60px', right: '60px' }} // Line confined to content area (inside page paddings)
            ></div>

            <button
                onClick={toggleMenu}
                aria-expanded={isOpen}
                aria-controls={`add-module-options-${buttonId}`}
                title="Añadir módulo aquí"
                className={`absolute top-1/2 transform -translate-y-1/2 z-30
                            w-8 h-8 flex items-center justify-center
                            bg-slate-200 dark:bg-gray-600 text-teal-700 dark:text-teal-400
                            rounded-full shadow-md
                            hover:bg-teal-500 dark:hover:bg-teal-500 hover:text-white dark:hover:text-white
                            focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500 dark:focus:ring-offset-gray-900
                            transition-all duration-150`}
                style={{ left: buttonLeftPosition, top: '50%', transform: 'translateY(-50%)' }} 
            >
                <MaterialIcon name="add" size="text-xl" />
            </button>

            {isOpen && (
                <div
                    id={`add-module-options-${buttonId}`}
                    className="add-module-options absolute z-40 w-72 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-md shadow-xl max-h-60 overflow-y-auto focus:outline-none"
                    data-add-module-options-id={buttonId}
                    role="menu"
                    style={{
                        left: menuLeftPosition, 
                        top: '50%',
                        transform: 'translateY(-50%)'
                    }}
                >
                    {Object.values(ModuleType).map(type => (
                        <button
                            key={type}
                            onClick={() => handleAdd(type)}
                            className="add-module-option-btn block w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-teal-50 dark:hover:bg-teal-700 hover:text-teal-700 dark:hover:text-white transition-colors"
                            role="menuitem"
                        >
                            <MaterialIcon name={getModuleIconName(type) || 'extension'} className="mr-2 text-base"/>
                            {getModuleName(type)}
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
};


// IconPickerModal Component
interface IconPickerModalProps {
  icons: string[];
  onSelectIcon: (iconName: string) => void;
  onClose: () => void;
}
export const IconPickerModal: React.FC<IconPickerModalProps> = ({ icons, onSelectIcon, onClose }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const modalRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const filteredIcons = searchTerm
    ? icons.filter(icon => icon.toLowerCase().includes(searchTerm.toLowerCase()))
    : icons;

  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.focus();
    }
    const handleClickOutside = (event: MouseEvent) => {
      if (modalRef.current && !modalRef.current.contains(event.target as Node)) {
        onClose();
      }
    };
    const handleEscKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleEscKey);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEscKey);
    };
  }, [onClose]);

  return (
    <div
        className="modal-overlay fixed inset-0 bg-gray-800 bg-opacity-75 flex items-center justify-center z-[2000] p-4 print:hidden"
        role="dialog"
        aria-modal="true"
        aria-labelledby="icon-picker-title"
    >
      <div
        ref={modalRef}
        className="modal-content bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-3xl max-h-[80vh] flex flex-col"
      >
        <header className="p-4 border-b border-gray-200 dark:border-gray-700">
          <h2 id="icon-picker-title" className="text-xl font-semibold text-gray-700 dark:text-gray-200">Seleccionar Ícono</h2>
          <input
            ref={inputRef}
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Buscar ícono..."
            className="mt-2 w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md dark:bg-gray-700 dark:text-gray-200 focus:ring-teal-500 focus:border-teal-500"
            aria-label="Buscar ícono"
          />
        </header>
        <div className="icon-grid p-4 overflow-y-auto grid grid-cols-[repeat(auto-fill,minmax(60px,1fr))] sm:grid-cols-[repeat(auto-fill,minmax(80px,1fr))] gap-2">
          {filteredIcons.map(iconName => (
            <button
              key={iconName}
              onClick={() => onSelectIcon(iconName)}
              title={iconName}
              className="icon-item-btn p-3 flex flex-col items-center justify-center rounded-md text-gray-600 dark:text-gray-300 hover:bg-teal-50 dark:hover:bg-teal-700 hover:text-teal-700 dark:hover:text-white aspect-square transition-colors focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-offset-1 dark:focus:ring-offset-gray-800"
              aria-label={`Seleccionar ícono ${iconName}`}
            >
              <MaterialIcon name={iconName} size="text-3xl" />
              <span className="text-xs mt-1 truncate max-w-full hidden sm:block">{iconName}</span>
            </button>
          ))}
           {filteredIcons.length === 0 && (
            <p className="col-span-full text-center text-gray-500 dark:text-gray-400 py-4">No se encontraron íconos.</p>
          )}
        </div>
        <footer className="p-4 border-t border-gray-200 dark:border-gray-700 flex justify-end">
          <button
            onClick={onClose}
            className="modal-cancel-btn py-2 px-4 bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-gray-200 rounded-md hover:bg-gray-300 dark:hover:bg-gray-500 transition-colors"
          >
            Cancelar
          </button>
        </footer>
      </div>
    </div>
  );
};

// ConfirmModal Component
interface ConfirmModalProps {
  title: string;
  message: string;
  onConfirm: () => void;
  onCancel: () => void;
  confirmButtonText?: string;
  cancelButtonText?: string;
}
export const ConfirmModal: React.FC<ConfirmModalProps> = ({
    title, message, onConfirm, onCancel,
    confirmButtonText = "Confirmar",
    cancelButtonText = "Cancelar"
}) => {
  const modalRef = useRef<HTMLDivElement>(null);
  const confirmButtonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (confirmButtonRef.current) {
        confirmButtonRef.current.focus();
    }
    const handleClickOutside = (event: MouseEvent) => {
      if (modalRef.current && !modalRef.current.contains(event.target as Node)) {
        onCancel();
      }
    };
    const handleEscKey = (event: KeyboardEvent) => {
        if (event.key === 'Escape') {
            onCancel();
        }
    };
    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleEscKey);
    return () => {
        document.removeEventListener('mousedown', handleClickOutside);
        document.removeEventListener('keydown', handleEscKey);
    };
  }, [onCancel]);

  return (
    <div
        className="modal-overlay fixed inset-0 bg-gray-800 bg-opacity-75 flex items-center justify-center z-[2000] p-4 print:hidden"
        role="alertdialog"
        aria-modal="true"
        aria-labelledby="confirm-modal-title"
        aria-describedby="confirm-modal-message"
    >
      <div ref={modalRef} className="modal-content bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-md w-full p-6 text-center">
        <h3 id="confirm-modal-title" className="text-lg font-semibold text-[var(--client-primary-dark)] dark:text-[var(--client-primary-light)] mb-2">{title}</h3>
        <p id="confirm-modal-message" className="text-sm text-gray-600 dark:text-gray-300 mb-4">{message}</p>
        <div className="modal-buttons flex justify-center gap-3">
          <button
            onClick={onCancel}
            className="confirm-modal-btn cancel py-2 px-4 bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-gray-200 rounded-md hover:bg-gray-300 dark:hover:bg-gray-500 font-medium transition-colors"
          >
            {cancelButtonText}
          </button>
          <button
            ref={confirmButtonRef}
            onClick={onConfirm}
            className="confirm-modal-btn confirm py-2 px-4 bg-red-600 text-white rounded-md hover:bg-red-700 font-medium transition-colors"
          >
            {confirmButtonText}
          </button>
        </div>
      </div>
    </div>
  );
};

// ImagePlaceholder Component
interface ImagePlaceholderProps {
  imageItem: ImageItem;
  onImageChange: (id: string, file: File | null, previewUrl: string | null) => void;
  className?: string;
}
export const ImagePlaceholder: React.FC<ImagePlaceholderProps> = ({ imageItem, onImageChange, className }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handlePlaceholderClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const newPreviewUrl = reader.result as string;
        onImageChange(imageItem.id, file, newPreviewUrl);
      };
      reader.readAsDataURL(file);
    }
    if(event.target) event.target.value = '';
  };

  const handleRemoveImage = (e: React.MouseEvent) => {
    e.stopPropagation();
    onImageChange(imageItem.id, null, null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const hasImage = !!imageItem.previewUrl;

  return (
    <div
      className={`group aspect-[4/3] border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg flex flex-col items-center justify-center cursor-pointer relative overflow-hidden transition-all duration-200 ease-in-out hover:border-teal-600 dark:hover:border-teal-400 hover:bg-slate-50 dark:hover:bg-gray-700/50 print:border-gray-300 ${className} ${hasImage ? 'border-solid image-placeholder-print-border has-image-print' : 'image-placeholder-print-border'}`}
      onClick={handlePlaceholderClick}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => { if(e.key === 'Enter' || e.key === ' ') handlePlaceholderClick();}}
      aria-label={hasImage ? `Imagen cargada: ${imageItem.file?.name || 'ver imagen'}. Click para cambiar.` : "Añadir imagen"}
    >
      <input
        type="file"
        accept="image/*"
        ref={fileInputRef}
        className="hidden"
        onChange={handleFileChange}
        aria-hidden="true"
      />
      {imageItem.previewUrl ? (
        <>
          <img src={imageItem.previewUrl} alt={imageItem.file?.name || "Vista previa de imagen"} className="w-full h-full object-cover absolute top-0 left-0" crossOrigin="anonymous"/>
          <button
            onClick={handleRemoveImage}
            className="remove-image-btn absolute top-2 right-2 bg-black/60 text-white rounded-full w-7 h-7 flex items-center justify-center opacity-0 group-hover:opacity-100 focus-within:opacity-100 print:hidden transition-opacity"
            aria-label="Eliminar imagen"
          >
            <MaterialIcon name="close" size="text-md" />
          </button>
        </>
      ) : (
        <div className="text-center text-gray-400 dark:text-gray-500">
          <MaterialIcon name="add_a_photo" size="text-4xl" />
          <span className="text-xs mt-2 block">Añadir imagen</span>
        </div>
      )}
    </div>
  );
};
