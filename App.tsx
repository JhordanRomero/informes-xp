

import React, { useState, useEffect, useCallback, ChangeEvent, useRef } from 'react';
import { ReportPageData, Client, ModuleType, Module, IconPickerTarget, ModuleDataMap, InfoGridItem, ParticipationStatItem, ParticipationModuleData, JornadaItem, AspectosClaveItem, DesafiosOportunidadesItem, BulletListItem, ImageItem, ParticipationGroupItem, RichTextModuleData } from './types';
import { AVAILABLE_CLIENTS, generateUniqueId, getModuleName, getModuleIconName, MATERIAL_ICONS } from './constants';
import { ControlsPanel, ReportPageDisplay, IconPickerModal, ConfirmModal, AddModuleButtonPlacement, MaterialIcon } from './components';
import { cloneDeep } from 'lodash-es';
import mammoth from 'mammoth';
import * as pdfjsLib from 'pdfjs-dist';
import { GoogleGenAI, GenerateContentResponse } from "@google/genai";
import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';

pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://esm.sh/pdfjs-dist@4.5.136/build/pdf.worker.min.mjs';

const MAX_STATS_PARTICIPATION = 6; // Max stats per group


const getDefaultPageContent = (pageId: string, client: Client): ReportPageData => {
  const createRichLabel = (text: string) => `<span class="font-semibold">${text}</span>`;
  
  const createModuleHeader = (moduleType: ModuleType, title?: string): string => {
    const iconName = getModuleIconName(moduleType);
    const moduleNameStr = title || getModuleName(moduleType);
    if (moduleType === ModuleType.INFO_GRID && !title) return ''; 
    const headerIconHtml = iconName ? `<span class='material-icons-round text-xl mr-2 align-middle'>${iconName}</span>` : '';
    return `${headerIconHtml}${moduleNameStr}`;
  };

  return {
    id: pageId,
    reportTitle: "Informe Breve de Cierre - Taller Presencial",
    clientLogoUrl: client.logoUrl,
    modules: [
      { 
        id: generateUniqueId('module-info'), 
        type: ModuleType.INFO_GRID, 
        sectionHeaderHTML: createModuleHeader(ModuleType.INFO_GRID), 
        data: { items: [ 
          { id: generateUniqueId('info'), iconName: 'store', labelHTML: createRichLabel('Local / Tienda:'), value: 'Centro de Formación Principal' }, 
          { id: generateUniqueId('info'), iconName: 'schedule', labelHTML: createRichLabel('Horario Programado:'), value: '8:30 a 17:30 Hrs' },
          { id: generateUniqueId('info'), iconName: 'badge', labelHTML: createRichLabel('Facilitador(a) Líder:'), value: 'Enrique Alberto Muñoz' },
          { id: generateUniqueId('info'), iconName: 'event', labelHTML: createRichLabel('Fecha de Ejecución:'), value: '24/05/2025' }
        ]}
      },
      { 
        id: generateUniqueId('module-participation'), 
        type: ModuleType.PARTICIPATION, 
        sectionHeaderHTML: createModuleHeader(ModuleType.PARTICIPATION),
        data: { 
          groups: [{
            id: generateUniqueId('part-group'),
            // groupTitle: "Participantes Generales", // Example if a title is needed for a single default group
            stats: [
              { id: generateUniqueId('part-stat'), iconName: 'group_add', labelText: 'Convocados', value: '11'}, 
              { id: generateUniqueId('part-stat'), iconName: 'how_to_reg', labelText: 'Asistentes', value: '5' }
            ], 
            groupSummary: 'El grupo reducido se debió al número de ingresos programados para ese día. Esta condición permitió generar un espacio más cercano, donde los participantes se mostraron atentos y con buena disposición durante toda la jornada.'
          }],
          // overallModuleSummary: "Este es un resumen general para todo el módulo de participación." // Example
        } as ParticipationModuleData
      },
      {
        id: generateUniqueId('module-jornada'),
        type: ModuleType.JORNADA_FORMATIVA,
        sectionHeaderHTML: createModuleHeader(ModuleType.JORNADA_FORMATIVA),
        data: {
          introduction: 'El taller se realizó en formato de co-facilitación, integrando a nuevos miembros del equipo para liderar diferentes módulos. Esta dinámica aportó diversidad y enriqueció la experiencia formativa tanto para el equipo como para los participantes.',
          items: [
            { id: generateUniqueId('jornada-item'), description: 'Gabriel mostró gran dominio de los contenidos y buena conexión con el grupo.' },
            { id: generateUniqueId('jornada-item'), description: 'Lu se desenvolvió con naturalidad y empatía, fortaleciendo su rol como facilitadora.' },
            { id: generateUniqueId('jornada-item'), description: 'Rodrigo propuso una trivia para reforzar contenidos, incorporando elementos lúdicos que sumaron dinamismo a la jornada.' }
          ]
        }
      },
      {
        id: generateUniqueId('module-aspectos'),
        type: ModuleType.ASPECTOS_CLAVE,
        sectionHeaderHTML: createModuleHeader(ModuleType.ASPECTOS_CLAVE),
        data: {
          items: [
            { id: generateUniqueId('aspecto-item'), itemLabelHTML: createRichLabel('Contenidos:'), description: 'Se abordaron en su totalidad, respetando los tiempos planificados.' },
            { id: generateUniqueId('aspecto-item'), itemLabelHTML: createRichLabel('Dinámicas:'), description: 'Se adaptaron exitosamente al tamaño del grupo.' },
            { id: generateUniqueId('aspecto-item'), itemLabelHTML: createRichLabel('Logística:'), description: 'Todos los aspectos operativos funcionaron correctamente (materiales, sala, coffee, coordinación).' }
          ]
        }
      },
      {
        id: generateUniqueId('module-desafios'),
        type: ModuleType.DESAFIOS_OPORTUNIDADES,
        sectionHeaderHTML: createModuleHeader(ModuleType.DESAFIOS_OPORTUNIDADES),
        data: {
          items: [
            { id: generateUniqueId('desafio-item'), itemLabelHTML: createRichLabel('Desafío:'), description: 'En grupos reducidos, puede presentarse mayor timidez o menor participación espontánea. Esto representa una oportunidad para seguir fortaleciendo estrategias que motiven a los participantes a involucrarse más activamente, como el uso de dinámicas personalizadas, preguntas abiertas o instancias más colaborativas desde el inicio.' },
            { id: generateUniqueId('desafio-item'), itemLabelHTML: createRichLabel('Oportunidad:'), description: 'La escala más íntima del grupo permitió una interacción cercana y la posibilidad de personalizar el acompañamiento. Además, se generó un ambiente seguro para quienes ingresan a la empresa, lo que facilita su proceso de integración.' }
          ]
        }
      },
      {
        id: generateUniqueId('module-cierre'),
        type: ModuleType.CIERRE_CONCLUSION,
        sectionHeaderHTML: createModuleHeader(ModuleType.CIERRE_CONCLUSION),
        data: {
          text: 'Fue una jornada positiva y enriquecedora. Se cumplieron los objetivos de la inducción y se generó un espacio de aprendizaje cercano, con buena disposición por parte de los asistentes. El equipo continúa fortaleciendo su experiencia en facilitación, manteniendo un enfoque de mejora continua para cada sesión.'
        }
      },
      { 
        id: generateUniqueId('module-visual'), 
        type: ModuleType.EVIDENCIA_VISUAL, 
        sectionHeaderHTML: createModuleHeader(ModuleType.EVIDENCIA_VISUAL), 
        data: { 
            introText: 'Se adjuntan fotografías que reflejan el desarrollo del taller y la participación de los asistentes.', 
            images: [ { id: generateUniqueId('img-page')} ] // Starts with one image placeholder
        }
      },
    ]
  };
};


const App: React.FC = () => {
  const [pages, setPages] = useState<ReportPageData[]>([]);
  const [currentClient, setCurrentClient] = useState<Client>(AVAILABLE_CLIENTS[0]);
  
  const [iconPicker, setIconPicker] = useState<IconPickerTarget | null>(null);
  const [confirmModal, setConfirmModal] = useState<{ title: string; message: string; onConfirm: () => void; confirmButtonText?: string; cancelButtonText?: string;} | null>(null);
  
  const [activeModuleMenuId, setActiveModuleMenuId] = useState<string | null>(null);
  const [activeAddModuleMenu, setActiveAddModuleMenu] = useState<string | null>(null);

  const [isImporting, setIsImporting] = useState(false);
  const [importError, setImportError] = useState<string | null>(null);
  const [importSuccess, setImportSuccess] = useState<string | null>(null);
  const [importProgressMessage, setImportProgressMessage] = useState<string>('');
  const [fakeImportProgressPercent, setFakeImportProgressPercent] = useState(0);
  const importIntervalRef = useRef<number | null>(null);

  const [isExporting, setIsExporting] = useState(false);
  const [exportStatusMessage, setExportStatusMessage] = useState<string | null>(null);


  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY! });

  useEffect(() => {
    if (AVAILABLE_CLIENTS.length === 0) {
        // Handle the case where no clients are available, e.g., set a default placeholder
        // or prevent app initialization. For now, we'll log an error.
        console.error("No clients available. Application may not function correctly.");
        // Potentially set a default minimal client configuration or show an error UI
        const placeholderClient: Client = {
            id: 'placeholder',
            name: 'Sin Cliente',
            logoUrl: '',
            colors: { /* some default safe colors */ 
                primary: '#777777', primaryDark: '#555555', primaryLight: '#999999', primaryExtraLight: '#EEEEEE',
                textOnPrimary: '#FFFFFF', textOnPrimaryLight: '#333333', textOnPrimaryExtraLight: '#333333',
                bodyText: '#333333', baseBrandColor: '#777777', highlightText: '#555555', readableTextOverride: '#000000'
            }
        };
        setCurrentClient(placeholderClient);
        const initialPageId: string = generateUniqueId('page');
        const initialPageContent: ReportPageData = getDefaultPageContent(initialPageId, placeholderClient);
        setPages([initialPageContent]);
        return;
    }
    const initialPageId: string = generateUniqueId('page');
    const clientForInitialPage: Client = currentClient || AVAILABLE_CLIENTS[0]; 
    const initialPageContent: ReportPageData = getDefaultPageContent(initialPageId, clientForInitialPage);
    setPages([initialPageContent]);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); 

  useEffect(() => {
    if (!currentClient) return; // Guard clause if currentClient is somehow null
    const root = document.documentElement;
    Object.entries(currentClient.colors).forEach(([key, value]) => {
      const cssVarName = `--client-${key.replace(/([A-Z])/g, '-$1').toLowerCase()}`;
      root.style.setProperty(cssVarName, value);
    });
  }, [currentClient]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;

      if (activeModuleMenuId && !target.closest(`[data-module-id="${activeModuleMenuId}"] .module-controls-button`) && !target.closest(`[data-module-id="${activeModuleMenuId}"] .module-menu`)) {
        setActiveModuleMenuId(null);
      }
      
      if (activeAddModuleMenu && !target.closest(`[data-add-module-button-id="${activeAddModuleMenu}"]`) && !target.closest(`[data-add-module-options-id="${activeAddModuleMenu}"]`)) {
          setActiveAddModuleMenu(null);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [activeModuleMenuId, activeAddModuleMenu]);

  useEffect(() => {
    if (isImporting) {
      if (!importIntervalRef.current) { // Start interval only if not already running
        importIntervalRef.current = window.setInterval(() => {
          setFakeImportProgressPercent(prevPercent => {
            if (prevPercent >= 95) {
              if (importIntervalRef.current) clearInterval(importIntervalRef.current);
              importIntervalRef.current = null;
              return 95; // Cap at 95 from interval
            }
            return prevPercent + (Math.floor(Math.random() * 2) + 1); // Increment by 1 or 2
          });
        }, 250); // Adjust timing for desired speed
      }
    } else { // Not importing
      if (importIntervalRef.current) {
        clearInterval(importIntervalRef.current);
        importIntervalRef.current = null;
      }
    }

    return () => { 
      if (importIntervalRef.current) {
        clearInterval(importIntervalRef.current);
        importIntervalRef.current = null;
      }
    };
  }, [isImporting]);


  const handleClientChange = (newClientLogoUrl: string) => {
    const newClient = AVAILABLE_CLIENTS.find(c => c.logoUrl === newClientLogoUrl) || (AVAILABLE_CLIENTS.length > 0 ? AVAILABLE_CLIENTS[0] : null);
    if (newClient) {
        setCurrentClient(newClient);
        setPages(prevPages => prevPages.map(p => ({ 
            ...p, 
            clientLogoUrl: newClient.logoUrl,
        })));
    } else {
        console.warn("Selected client not found or no clients available.");
        // Handle missing client case, perhaps by setting a default or showing an error.
    }
  };

  const handleAddPage = () => {
    if (!currentClient && AVAILABLE_CLIENTS.length > 0) {
        setCurrentClient(AVAILABLE_CLIENTS[0]); // Ensure currentClient is set if it became null
    }
    if (!currentClient) {
        console.error("Cannot add page: No current client selected and no clients available.");
        // Optionally show an error to the user
        return;
    }
    setPages(prev => [...prev, getDefaultPageContent(generateUniqueId('page'), currentClient)]);
     setTimeout(() => {
        window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' });
    }, 100);
  };

  const handleDeletePage = (pageId: string) => {
    if (pages.length <= 1) {
      setConfirmModal({
          title: "Acción no permitida",
          message: "No puedes eliminar la única página del informe.",
          onConfirm: () => setConfirmModal(null), 
          confirmButtonText: "Entendido"
      });
      return;
    }
    setConfirmModal({
      title: "Eliminar Página",
      message: "¿Estás seguro de que quieres eliminar esta página? Esta acción no se puede deshacer.",
      onConfirm: () => {
        setPages(prev => prev.filter(p => p.id !== pageId));
        setConfirmModal(null);
      }
    });
  };

  const applyExportFixesToClonedDocument = (documentClone: Document, pageId: string) => {
    const clonedPage = documentClone.getElementById(pageId) as HTMLElement | null;
    if (clonedPage) {
        // General image handling
        const images = clonedPage.querySelectorAll('img');
        images.forEach(img => {
            const htmlImgElement = img as HTMLImageElement;
            htmlImgElement.onerror = null; 
            htmlImgElement.style.setProperty('display', 'inline-block', 'important');
            htmlImgElement.style.setProperty('visibility', 'visible', 'important');
            htmlImgElement.style.setProperty('opacity', '1', 'important');
        });
        
        clonedPage.style.boxShadow = 'none';
        clonedPage.style.backgroundColor = '#ffffff';

        // Participation Module Fixes
        clonedPage.querySelectorAll('.export-fix-participation-bg').forEach(el => {
            const htmlEl = el as HTMLElement;
            htmlEl.style.boxShadow = 'none'; 
            const primaryExtraLightColor = getComputedStyle(document.documentElement).getPropertyValue('--client-primary-extra-light').trim();
            htmlEl.style.backgroundColor = primaryExtraLightColor || '#e0f2fe'; 
        });
        clonedPage.querySelectorAll('.export-fix-participation-item').forEach(el => {
            const htmlEl = el as HTMLElement;
            htmlEl.style.boxShadow = 'none'; 
            htmlEl.style.backgroundColor = 'rgba(255, 255, 255, 1)'; 
        });
        clonedPage.querySelectorAll('.export-fix-participation-icon-button').forEach(el => {
            const btnEl = el as HTMLElement;
            btnEl.style.boxShadow = 'none';
            btnEl.style.backgroundColor = 'rgba(255, 255, 255, 1)';
            btnEl.style.display = 'flex';
            btnEl.style.alignItems = 'center';
            btnEl.style.justifyContent = 'center';
            
            const sizeInPx = '64px'; 
            btnEl.style.width = sizeInPx;
            btnEl.style.height = sizeInPx;
            btnEl.style.borderRadius = '50%'; 

            const highlightTextColor = getComputedStyle(document.documentElement).getPropertyValue('--client-highlight-text').trim();
            btnEl.style.borderWidth = '2px';
            btnEl.style.borderStyle = 'solid';
            btnEl.style.borderColor = highlightTextColor || 'blue'; // Fallback just in case
        });
        clonedPage.querySelectorAll('.export-fix-participation-icon').forEach(el => {
            const iconEl = el as HTMLElement;
            iconEl.style.lineHeight = '1'; 
            iconEl.style.display = 'inline-flex';
            iconEl.style.alignItems = 'center';
            iconEl.style.justifyContent = 'center';
            iconEl.style.transform = 'translateY(-8px)'; 
        });
        clonedPage.querySelectorAll('.export-fix-participation-value').forEach(el => {
            const valueEl = el as HTMLElement;
            valueEl.style.transform = 'translateY(-6px)';
        });
    } else {
        console.warn("Cloned page element not found for html2canvas processing:", pageId);
    }
  };


  const handleExportPdf = async () => {
    setIsExporting(true);
    setExportStatusMessage("Preparando PDF...");
  
    try {
      const reportPageElements = document.querySelectorAll('.report-page');
      if (reportPageElements.length === 0) {
        setExportStatusMessage("No se encontraron páginas para exportar a PDF.");
        setTimeout(() => setExportStatusMessage(null), 3000);
        setIsExporting(false);
        return;
      }
  
      const capturedPages: { dataUrl: string; width: number; height: number }[] = [];
  
      for (let i = 0; i < reportPageElements.length; i++) {
        const pageElement = reportPageElements[i] as HTMLElement;
        const pageId = pageElement.id;
  
        setExportStatusMessage(`Procesando página ${i + 1} de ${reportPageElements.length} para PDF...`);
  
        const originalBoxShadow = pageElement.style.boxShadow;
        const originalBackgroundColor = pageElement.style.backgroundColor;
        pageElement.style.boxShadow = 'none';
        pageElement.style.backgroundColor = '#ffffff';
  
        const canvas = await html2canvas(pageElement, {
          scale: 2,
          useCORS: true,
          backgroundColor: '#ffffff',
          logging: false,
          onclone: (documentClone) => {
            applyExportFixesToClonedDocument(documentClone, pageId);
          }
        });
  
        pageElement.style.boxShadow = originalBoxShadow;
        pageElement.style.backgroundColor = originalBackgroundColor;
  
        const dataUrl = canvas.toDataURL('image/png');
        capturedPages.push({ dataUrl, width: canvas.width, height: canvas.height });
        
        if (reportPageElements.length > 1 && i < reportPageElements.length - 1) {
          await new Promise(resolve => setTimeout(resolve, 100)); 
        }
      }
  
      if (capturedPages.length > 0) {
        setExportStatusMessage("Ensamblando PDF...");
        const firstPage = capturedPages[0];
        const pdf = new jsPDF({
          orientation: firstPage.width > firstPage.height ? 'l' : 'p',
          unit: 'px',
          format: [firstPage.width, firstPage.height],
        });
  
        pdf.addImage(firstPage.dataUrl, 'PNG', 0, 0, firstPage.width, firstPage.height);
  
        for (let i = 1; i < capturedPages.length; i++) {
          const currentPage = capturedPages[i];
          pdf.addPage([currentPage.width, currentPage.height], currentPage.width > currentPage.height ? 'l' : 'p');
          pdf.addImage(currentPage.dataUrl, 'PNG', 0, 0, currentPage.width, currentPage.height);
        }
  
        pdf.save(reportPageElements.length > 1 ? 'Reporte_Completo.pdf' : 'Reporte.pdf');
        setExportStatusMessage("¡PDF generado exitosamente!");
      } else {
        setExportStatusMessage("No se pudieron capturar páginas para el PDF.");
      }
  
      setTimeout(() => setExportStatusMessage(null), 3000);
  
    } catch (error) {
      console.error("Error exporting to PDF:", error);
      setExportStatusMessage(`Error al generar PDF: ${error instanceof Error ? error.message : String(error)}`);
      setTimeout(() => setExportStatusMessage(null), 5000);
    } finally {
      setIsExporting(false);
    }
  };

  const handleExportPng = async () => {
    setIsExporting(true);
    setExportStatusMessage("Generando PNG(s)...");
    try {
      const reportPageElements = document.querySelectorAll('.report-page');
      if (reportPageElements.length === 0) {
        setExportStatusMessage("No se encontraron páginas para exportar.");
        setTimeout(() => setExportStatusMessage(null), 3000);
        setIsExporting(false);
        return;
      }
  
      for (let i = 0; i < reportPageElements.length; i++) {
        const pageElement = reportPageElements[i] as HTMLElement;
        const pageId = pageElement.id; 
        
        const originalBoxShadow = pageElement.style.boxShadow;
        const originalBackgroundColor = pageElement.style.backgroundColor;
        
        pageElement.style.boxShadow = 'none';
        pageElement.style.backgroundColor = '#ffffff'; 
  
        setExportStatusMessage(`Generando PNG: Página ${i + 1} de ${reportPageElements.length}...`);
        
        const canvas = await html2canvas(pageElement, {
          scale: 2, 
          useCORS: true, 
          backgroundColor: '#ffffff', 
          logging: false, 
          onclone: (documentClone) => {
            applyExportFixesToClonedDocument(documentClone, pageId);
          }
        });
        
        pageElement.style.boxShadow = originalBoxShadow;
        pageElement.style.backgroundColor = originalBackgroundColor;
  
        const pngDataUrl = canvas.toDataURL('image/png');
        const link = document.createElement('a');
        link.href = pngDataUrl;
        link.download = reportPageElements.length > 1 ? `Reporte_Pagina_${i + 1}.png` : 'Reporte.png';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
  
        if (reportPageElements.length > 1 && i < reportPageElements.length - 1) {
          await new Promise(resolve => setTimeout(resolve, 300)); 
        }
      }
      setExportStatusMessage("¡PNG(s) generados exitosamente!");
      setTimeout(() => setExportStatusMessage(null), 3000);
    } catch (error) {
      console.error("Error exporting to PNG:", error);
      setExportStatusMessage(`Error al generar PNG: ${error instanceof Error ? error.message : String(error)}`);
      setTimeout(() => setExportStatusMessage(null), 5000);
    } finally {
      setIsExporting(false);
    }
  };


  const updatePageData = <K extends keyof ReportPageData>(pageIndex: number, field: K, value: ReportPageData[K]) => {
    setPages(prev => {
        const newPages = [...prev];
        const pageToUpdate = { ...newPages[pageIndex] };
        pageToUpdate[field] = value;
        newPages[pageIndex] = pageToUpdate;
        return newPages;
    });
  };
  
  const setDeepValueInState = (pageIndex: number, path: string, value: any) => {
    setPages(prevPages => {
        const newPages = cloneDeep(prevPages); 
        const keys = path.split('.');
        let currentTarget: any = newPages[pageIndex];

        for (let i = 0; i < keys.length - 1; i++) {
            const key = keys[i];
            const prevKey = i > 0 ? keys[i-1] : null;
            let isArrayIndex = /^\d+$/.test(key);
            
            if (prevKey && Array.isArray(currentTarget[prevKey]) && isArrayIndex) {
                 currentTarget = currentTarget[prevKey][parseInt(key)];
            } else if (isArrayIndex && Array.isArray(currentTarget)) { 
                 currentTarget = currentTarget[parseInt(key)];
            }
            else if (typeof currentTarget[key] === 'undefined' || currentTarget[key] === null) {
                 const nextKeyIsNumeric = (i + 1 < keys.length -1) && /^\d+$/.test(keys[i+1]);
                 currentTarget[key] = nextKeyIsNumeric ? [] : {};
                 currentTarget = currentTarget[key];
            } else {
                 currentTarget = currentTarget[key];
            }
             if (typeof currentTarget === 'undefined' || currentTarget === null) {
                console.error("Path became undefined/null at key:", key, "Full path:", path);
                return newPages; 
            }
        }
        
        const finalKey = keys[keys.length - 1];
        const finalKeyIsArrayIndex = /^\d+$/.test(finalKey);
        const prevKeyOfFinal = keys.length > 1 ? keys[keys.length - 2] : null;

        if (prevKeyOfFinal && Array.isArray(currentTarget[prevKeyOfFinal]) && finalKeyIsArrayIndex) {
             currentTarget[prevKeyOfFinal][parseInt(finalKey)] = value;
        } else if (Array.isArray(currentTarget) && finalKeyIsArrayIndex) {
             currentTarget[parseInt(finalKey)] = value;
        }
        else {
            currentTarget[finalKey] = value;
        }
        return newPages;
    });
  };

  const createModuleHeaderFromData = (moduleType: ModuleType, title?: string): string => {
    const iconName = getModuleIconName(moduleType);
    let moduleNameStr = title || getModuleName(moduleType);
    
    if (moduleType === ModuleType.PARTICIPATION && !title) {
        moduleNameStr = getModuleName(ModuleType.PARTICIPATION);
    }

    if (moduleType === ModuleType.INFO_GRID && !title) return ''; 
    
    const headerIconHtml = iconName ? `<span class='material-icons-round text-xl mr-2 align-middle'>${iconName}</span>` : '';
    return `${headerIconHtml}${moduleNameStr}`;
  };


  const handleAddModule = (pageIndex: number, moduleType: ModuleType, insertAtIndex: number) => {
    const defaultData: any = (() => {
        const baseId = generateUniqueId('item');
        switch (moduleType) {
            case ModuleType.INFO_GRID: return { items: [{id: baseId, iconName: 'label_important', labelHTML: 'Nuevo Campo:', value: 'Valor'}] };
            case ModuleType.PARTICIPATION: 
                return { 
                    groups: [{
                        id: generateUniqueId('part-group-new'),
                        stats: [{id: baseId, iconName: 'person', labelText: 'Nueva Métrica', value: '0'}], 
                        groupSummary: 'Resumen del grupo.'
                    }],
                    overallModuleSummary: ''
                } as ParticipationModuleData;
            case ModuleType.JORNADA_FORMATIVA: return { introduction: 'Introducción a la jornada.', items: [{id: baseId, itemLabelHTML: `<strong>Punto Nuevo:</strong>`, description: 'Descripción del nuevo punto.'}]};
            case ModuleType.ASPECTOS_CLAVE: return { items: [{id: baseId, itemLabelHTML: '<strong>Aspecto Destacado:</strong>', description: 'Descripción del aspecto.'}]};
            case ModuleType.DESAFIOS_OPORTUNIDADES: return { items: [{id: baseId, itemLabelHTML: '<strong>Desafío/Oportunidad:</strong>', description: 'Descripción.'}]};
            case ModuleType.CIERRE_CONCLUSION: return { text: 'Conclusión del taller.' };
            case ModuleType.EVIDENCIA_VISUAL: return { introText: 'Imágenes del evento.', images: [{id: generateUniqueId('img-new')}]}; // Starts with one image
            case ModuleType.RICH_TEXT: return { contentHTML: '<p>Contenido de texto enriquecido...</p>' };
            case ModuleType.BULLET_LIST: return { listItems: [{id: baseId, itemLabelHTML: '<strong>Nuevo Ítem:</strong>', description: 'Detalle del ítem.'}]};
            default: return {};
        }
    })();
    
    const newModule: Module = {
      id: generateUniqueId('module'),
      type: moduleType,
      sectionHeaderHTML: createModuleHeaderFromData(moduleType),
      data: defaultData as ModuleDataMap[typeof moduleType] 
    };

    setPages(prev => prev.map((page, idx) => {
      if (idx === pageIndex) {
        const newModules = [...page.modules];
        newModules.splice(insertAtIndex, 0, newModule);
        return { ...page, modules: newModules };
      }
      return page;
    }));
    setActiveAddModuleMenu(null);
  };

  // --- Generic Item Handlers ---
  const handleAddItemToModuleList = (
    pageIndex: number, 
    moduleIndex: number, 
    listPath: 'items' | 'listItems', // Path to the array within module.data
    newItem: InfoGridItem | JornadaItem | AspectosClaveItem | DesafiosOportunidadesItem | BulletListItem
  ) => {
    setPages(prevPages => {
      const newPages = cloneDeep(prevPages);
      const module = newPages[pageIndex].modules[moduleIndex];
      if (module && module.data && Array.isArray((module.data as any)[listPath])) {
        (module.data as any)[listPath].push(newItem);
      }
      setActiveModuleMenuId(null);
      return newPages;
    });
  };

  const handleDeleteItemFromModuleList = (
    pageIndex: number, 
    moduleIndex: number, 
    itemIndex: number,
    listPath: 'items' | 'listItems',
    moduleNameForWarning: string
  ) => {
    setPages(prevPages => {
      const newPages = cloneDeep(prevPages);
      const module = newPages[pageIndex].modules[moduleIndex];
      const list = (module?.data as any)?.[listPath];
      if (module && list && Array.isArray(list)) {
        if (list.length > 1) {
          list.splice(itemIndex, 1);
        } else {
          console.warn(`Cannot delete the last item from ${moduleNameForWarning}.`);
          // Optionally show a toast/notification
        }
      }
      return newPages;
    });
  };

  // --- InfoGrid Handlers ---
  const handleAddFieldToInfoGrid = (pageIndex: number, moduleIndex: number) => {
    const newItem: InfoGridItem = { 
      id: generateUniqueId('info-new'), 
      iconName: 'label_important', 
      labelHTML: 'Nuevo Campo:', 
      value: 'Valor Predeterminado' 
    };
    handleAddItemToModuleList(pageIndex, moduleIndex, 'items', newItem);
  };
  const handleDeleteItemFromInfoGrid = (pageIndex: number, moduleIndex: number, itemIndex: number) => {
    handleDeleteItemFromModuleList(pageIndex, moduleIndex, itemIndex, 'items', 'Cuadrícula de Información');
  };

  // --- JornadaFormativa Handlers ---
  const handleAddPointToJornadaFormativa = (pageIndex: number, moduleIndex: number) => {
    const newItem: JornadaItem = { 
      id: generateUniqueId('jornada-new'), 
      description: 'Nuevo punto de la jornada.',
      itemLabelHTML: '<strong>Punto Nuevo:</strong>' 
    };
    handleAddItemToModuleList(pageIndex, moduleIndex, 'items', newItem);
  };
  const handleDeleteItemFromJornadaFormativa = (pageIndex: number, moduleIndex: number, itemIndex: number) => {
    handleDeleteItemFromModuleList(pageIndex, moduleIndex, itemIndex, 'items', 'Desarrollo de la Jornada');
  };

  // --- AspectosClave Handlers ---
  const handleAddAspectoClave = (pageIndex: number, moduleIndex: number) => {
    const newItem: AspectosClaveItem = { 
      id: generateUniqueId('aspecto-new'), 
      itemLabelHTML: '<strong>Nuevo Aspecto:</strong>', 
      description: 'Descripción del nuevo aspecto.' 
    };
    handleAddItemToModuleList(pageIndex, moduleIndex, 'items', newItem);
  };
  const handleDeleteItemFromAspectosClave = (pageIndex: number, moduleIndex: number, itemIndex: number) => {
    handleDeleteItemFromModuleList(pageIndex, moduleIndex, itemIndex, 'items', 'Aspectos Clave');
  };
  
  // --- DesafiosOportunidades Handlers ---
  const handleAddDesafioOportunidad = (pageIndex: number, moduleIndex: number) => {
    const newItem: DesafiosOportunidadesItem = { 
      id: generateUniqueId('desafio-new'), 
      itemLabelHTML: '<strong>Nuevo Desafío/Oportunidad:</strong>', 
      description: 'Descripción.' 
    };
    handleAddItemToModuleList(pageIndex, moduleIndex, 'items', newItem);
  };
  const handleDeleteItemFromDesafiosOportunidades = (pageIndex: number, moduleIndex: number, itemIndex: number) => {
    handleDeleteItemFromModuleList(pageIndex, moduleIndex, itemIndex, 'items', 'Desafíos y Oportunidades');
  };
  
  // --- BulletList Handlers ---
  const handleAddBulletListItem = (pageIndex: number, moduleIndex: number) => {
    const newItem: BulletListItem = { 
        id: generateUniqueId('bullet-new'), 
        itemLabelHTML: '<strong>Nuevo Ítem:</strong>', 
        description: 'Detalle del ítem.' 
    };
    handleAddItemToModuleList(pageIndex, moduleIndex, 'listItems', newItem);
  };
  const handleDeleteBulletListItem = (pageIndex: number, moduleIndex: number, itemIndex: number) => {
    handleDeleteItemFromModuleList(pageIndex, moduleIndex, itemIndex, 'listItems', 'Lista de Viñetas');
  };

  // --- Participation Module Group/Metric Handlers ---
  const handleAddParticipationGroup = (pageIndex: number, moduleIndex: number) => {
    setPages(prevPages => {
        const newPages = cloneDeep(prevPages);
        const participationModule = newPages[pageIndex].modules[moduleIndex] as Module<ModuleType.PARTICIPATION>;
        if (!participationModule || participationModule.type !== ModuleType.PARTICIPATION) return newPages;

        const newGroup: ParticipationGroupItem = {
            id: generateUniqueId('part-group-new'),
            groupTitle: `Nuevo Grupo ${participationModule.data.groups.length + 1}`,
            stats: [{ id: generateUniqueId('part-stat-new'), iconName: 'person', labelText: 'Asistentes', value: '0' }],
            groupSummary: ''
        };
        participationModule.data.groups.push(newGroup);
        setActiveModuleMenuId(null);
        return newPages;
    });
  };

  const handleDeleteParticipationGroup = (pageIndex: number, moduleIndex: number, groupIndexToDelete: number) => {
      setPages(prevPages => {
          const newPages = cloneDeep(prevPages);
          const participationModule = newPages[pageIndex].modules[moduleIndex] as Module<ModuleType.PARTICIPATION>;
          if (!participationModule || participationModule.type !== ModuleType.PARTICIPATION) return newPages;

          if (participationModule.data.groups.length > 1) { 
              participationModule.data.groups.splice(groupIndexToDelete, 1);
          } else {
              console.warn("Cannot delete the last participation group.");
          }
          return newPages;
      });
  };

  const handleAddMetricToGroup = (pageIndex: number, moduleIndex: number, groupIndex: number) => {
      setPages(prevPages => {
          const newPages = cloneDeep(prevPages);
          const participationModule = newPages[pageIndex].modules[moduleIndex] as Module<ModuleType.PARTICIPATION>;
          if (!participationModule || participationModule.type !== ModuleType.PARTICIPATION) return newPages;
          
          const group = participationModule.data.groups[groupIndex];
          if (group && group.stats.length < MAX_STATS_PARTICIPATION) {
              const newStat: ParticipationStatItem = {
                  id: generateUniqueId('part-stat-new'),
                  iconName: 'emoji_events',
                  labelText: 'Nueva Métrica',
                  value: '0',
              };
              group.stats.push(newStat);
          }
          setActiveModuleMenuId(null); // Close group menu if open
          return newPages;
      });
  };
  
  const handleDeleteMetricFromGroup = (pageIndex: number, moduleIndex: number, groupIndex: number, statIndexToDelete: number) => {
      setPages(prevPages => {
          const newPages = cloneDeep(prevPages);
          const participationModule = newPages[pageIndex].modules[moduleIndex] as Module<ModuleType.PARTICIPATION>;
          if (!participationModule || participationModule.type !== ModuleType.PARTICIPATION) return newPages;

          const group = participationModule.data.groups[groupIndex];
          if (group && group.stats.length > 1) { 
              group.stats.splice(statIndexToDelete, 1);
          } else {
              console.warn("Cannot delete the last metric in a group.");
          }
          return newPages;
      });
  };

  // --- Evidencia Visual Handler ---
  const handleAddImageToEvidenciaVisualModule = (pageIndex: number, moduleIndex: number) => {
    setPages(prevPages => {
        const newPages = cloneDeep(prevPages);
        const evidenciaModule = newPages[pageIndex].modules[moduleIndex] as Module<ModuleType.EVIDENCIA_VISUAL>;
        if (!evidenciaModule || evidenciaModule.type !== ModuleType.EVIDENCIA_VISUAL) return newPages;

        const newImageItem: ImageItem = { id: generateUniqueId('img-new') };
        evidenciaModule.data.images.push(newImageItem);
        setActiveModuleMenuId(null); 
        return newPages;
    });
  };

  // --- General Module Handlers ---
  const handleDeleteModule = (pageIndex: number, moduleIndex: number) => {
    setConfirmModal({
        title: "Eliminar Módulo",
        message: "¿Estás seguro de que quieres eliminar este módulo? Esta acción no se puede deshacer.",
        onConfirm: () => {
            setPages(prev => prev.map((page, idx) => {
            if (idx === pageIndex) {
                return { ...page, modules: page.modules.filter((_, mIdx) => mIdx !== moduleIndex) };
            }
            return page;
            }));
            setActiveModuleMenuId(null);
            setConfirmModal(null);
        }
    });
  };
  
const regenerateIdsInData = (data: any, type: ModuleType): any => {
    const newClonedData = cloneDeep(data);
    const regenerateList = (list: any[], idField: string = 'id', prefix: string) => list.map(item => ({ ...item, [idField]: generateUniqueId(prefix) }));

    switch (type) {
        case ModuleType.INFO_GRID: if (newClonedData.items) newClonedData.items = regenerateList(newClonedData.items, 'id', 'info'); break;
        case ModuleType.PARTICIPATION:
            if (newClonedData.groups) {
                newClonedData.groups = (newClonedData.groups as ParticipationGroupItem[]).map(group => ({
                    ...group,
                    id: generateUniqueId('part-group'),
                    stats: regenerateList(group.stats || [], 'id', 'part-stat')
                }));
            }
            break;
        case ModuleType.JORNADA_FORMATIVA: 
            if (newClonedData.items) {
                newClonedData.items = (newClonedData.items as JornadaItem[]).map(item => ({
                    ...item,
                    id: generateUniqueId('jornada-item')
                }));
            }
            break;
        case ModuleType.BULLET_LIST: 
            if (newClonedData.listItems) {
                 newClonedData.listItems = (newClonedData.listItems as BulletListItem[]).map(item => ({
                    ...item,
                    id: generateUniqueId('listitem')
                }));
            }
            break;
        case ModuleType.ASPECTOS_CLAVE: if (newClonedData.items) newClonedData.items = regenerateList(newClonedData.items, 'id', 'aspecto-item'); break;
        case ModuleType.DESAFIOS_OPORTUNIDADES: if (newClonedData.items) newClonedData.items = regenerateList(newClonedData.items, 'id', 'desafio-item'); break;
        case ModuleType.EVIDENCIA_VISUAL: 
            if (newClonedData.images) {
                newClonedData.images = (newClonedData.images as ImageItem[]).map(() => ({ 
                    id: generateUniqueId('img-dup'), 
                    file: undefined, 
                    previewUrl: undefined
                }));
            } else { 
                newClonedData.images = [ {id: generateUniqueId('img-dup')}];
            }
            break;
    }
    return newClonedData;
};

  const handleDuplicateModule = (pageIndex: number, moduleIndex: number) => {
    setPages(prevPages => {
        const newPages = [...prevPages]; 
        const pageToUpdate = cloneDeep(newPages[pageIndex]); 
        
        const originalModule = pageToUpdate.modules[moduleIndex];
        const newModuleDataWithNewIds = regenerateIdsInData(originalModule.data, originalModule.type);

        const newDuplicatedModule: Module = {
            ...cloneDeep(originalModule), 
            id: generateUniqueId('module-dup'),
            data: newModuleDataWithNewIds,
        };

        pageToUpdate.modules.splice(moduleIndex + 1, 0, newDuplicatedModule);
        newPages[pageIndex] = pageToUpdate; 
        setActiveModuleMenuId(null);
        return newPages;
    });
  };

  const handleIconSelected = (selectedIconName: string) => {
    if (iconPicker) {
      const { pageIndex, path } = iconPicker;
      
      if (path.endsWith('.sectionHeaderHTML')) {
        const pathParts = path.split('.'); 
        if (pathParts.length < 2 || pathParts[0] !== 'modules') {
            console.error('Invalid path for sectionHeaderHTML:', path);
            setIconPicker(null);
            return;
        }
        const moduleIndex = parseInt(pathParts[1]);
        
        if (isNaN(moduleIndex) || moduleIndex < 0 || moduleIndex >= pages[pageIndex].modules.length) {
            console.error('Invalid moduleIndex from path:', path);
            setIconPicker(null);
            return;
        }

        const oldSectionHeaderHtml = pages[pageIndex].modules[moduleIndex].sectionHeaderHTML;
        const iconSpanRegex = /^(?:<span class='material-icons-round text-xl mr-2 align-middle'>[^<]+<\/span>)?(.*)$/s;
        const match = oldSectionHeaderHtml.match(iconSpanRegex);
        const textPart = match && match[1] !== undefined ? match[1] : oldSectionHeaderHtml; 

        const newHeaderHtml = `<span class='material-icons-round text-xl mr-2 align-middle'>${selectedIconName}</span>${textPart}`;
        setDeepValueInState(pageIndex, path, newHeaderHtml);

      } else { 
        setDeepValueInState(pageIndex, path, selectedIconName);
      }
    }
    setIconPicker(null);
  };

  const getGeminiPromptForReportExtraction = (documentText: string): string => {
    return `
      Analiza el siguiente texto extraído de un documento de informe de taller y conviértelo en una estructura JSON.
      El JSON debe tener dos claves principales: "reportTitle" (string) y "modules" (array).

      Para "reportTitle", extrae el título principal del informe.

      Para "modules", cada elemento del array debe ser un objeto representando un módulo del informe.
      Cada módulo debe tener:
      - "type": Una cadena que coincida con uno de los siguientes ModuleType: ${Object.values(ModuleType).join(', ')}.
      - "suggestedSectionHeader" (opcional): Un título textual para la sección del módulo (ej: "Detalles del Taller", "Participación y Asistencia"). Para módulos de tipo PARTICIPATION, si no se sugiere un título, se usará "Participación y Asistencia" por defecto.
      - "data": Un objeto que contiene los datos específicos del módulo. La estructura de "data" varía según el "type".

      **Directriz Clave sobre el Texto Original:** Al extraer texto para los campos de datos (como \`reportTitle\`, \`introduction\`, \`description\`, \`text\`, \`contentHTML\`, \`labelHTML\`, \`value\` en \`INFO_GRID\`, \`groupTitle\`, \`groupSummary\`, \`overallModuleSummary\`, \`introText\`, etc.), mantén el texto lo más fiel posible al documento original. **No debes parafrasear, resumir, ni alterar el contenido textual**, a menos que se especifique explícitamente lo contrario para un campo particular.
      Las excepciones principales son:
        1. Para el módulo \`PARTICIPATION\`, donde se te pide procesar la información para extraer \`labelText\` y \`value\` numéricos de las estadísticas, lo cual puede implicar una ligera reestructuración del texto original para esos campos específicos como se detalla en las instrucciones de \`PARTICIPATION\`.
        2. Para los "títulos de puntos" dentro de módulos tipo lista, como se detalla a continuación.

      **Directriz Clave sobre Formato de Títulos de Puntos en Listas:**
      Para los módulos que presentan información como una lista de puntos (JORNADA_FORMATIVA, ASPECTOS_CLAVE, DESAFIOS_OPORTUNIDADES, BULLET_LIST):
      - Si un punto tiene una etiqueta o frase inicial que actúa como título (ej. "Contenidos:", "Desafío:", "Subtema Importante:"), esta etiqueta o frase DEBE estar en negrita usando etiquetas \`<strong>\`.
      - El texto descriptivo principal que sigue a estos títulos/etiquetas debe permanecer en formato normal, sin negrita.
      - Si un punto no tiene una etiqueta o título claro, todo su texto permanece en formato normal.

      Aquí están las estructuras de "data" para cada ModuleType y cómo identificar la información:

      1.  **INFO_GRID**: Busca información general como local, tienda, horario, facilitador, fecha.
          "data": { "items": [{"iconName": "string", "labelHTML": "string HTML", "value": "string"}, ...] }
          - Intenta asignar un iconName relevante de Material Icons (ej: 'store', 'schedule', 'badge', 'event').
          - labelHTML puede contener HTML simple como <strong>. El texto de labelHTML y value debe ser fiel al original.

      2.  **PARTICIPATION**: Busca estadísticas de participación y resúmenes. Este módulo puede tener múltiples grupos de participantes.
          "data": {
            "groups": [ 
              {
                "groupTitle": "string (opcional)", 
                "stats": [{"iconName": "string", "labelText": "string", "value": "string (solo el número)"}, ...], 
                "groupSummary": "string (opcional)" 
              },
            ],
            "overallModuleSummary": "string (opcional)", 
            "generalizedParticipationCommentary": "string (opcional)", 
            "suggestedTitleForGeneralizedCommentary": "string (opcional)" 
          }
          - Para "labelText": Etiqueta descriptiva (ej: "Personas Convocadas"). NO incluyas el número ni dos puntos (:) al final. Transformación permitida.
          - Para "value": SOLO el valor numérico (ej: "29"). Transformación permitida.

      3.  **JORNADA_FORMATIVA**: Busca una introducción y una lista de puntos sobre el desarrollo de la jornada.
          "data": { 
            "introduction": "string", 
            "items": [
              {"itemLabelHTML": "string HTML (opcional, ej: '<strong>Observación:</strong>'. DEBE estar en negrita si existe)", "description": "string (texto principal del punto, en formato normal)"}, 
              ...
            ] 
          }
          - Si el punto tiene una etiqueta o frase inicial, colócala en \`itemLabelHTML\` y asegúrate de que esté en negrita. La descripción va en \`description\` en formato normal.

      4.  **ASPECTOS_CLAVE**: Busca puntos destacados o aspectos clave.
          "data": { "items": [{"itemLabelHTML": "string HTML (DEBE estar en negrita, ej: '<strong>Contenidos:</strong>')", "description": "string (texto en formato normal)"}, ...] }

      5.  **DESAFIOS_OPORTUNIDADES**: Busca desafíos y oportunidades.
          "data": { "items": [{"itemLabelHTML": "string HTML (DEBE estar en negrita, ej: '<strong>Desafío:</strong>')", "description": "string (texto en formato normal)"}, ...] }

      6.  **CIERRE_CONCLUSION**: Busca el texto de cierre o conclusión general del informe.
          "data": { "text": "string" } 

      7.  **EVIDENCIA_VISUAL**: Busca texto introductorio para evidencia visual. "images" debe ser un array vacío.
          "data": { "introText": "string", "images": [] } 

      8.  **RICH_TEXT**: Párrafos de texto generales que no encajan en otras categorías.
          "data": { "contentHTML": "string HTML" } 

      9.  **BULLET_LIST**: Listas de viñetas o numeradas. Cada ítem puede tener una etiqueta/título y una descripción.
          "data": { "listItems": [{"itemLabelHTML": "string HTML (opcional, DEBE estar en negrita si existe, ej: '<strong>Subtema Importante:</strong>')", "description": "string (texto principal del ítem, en formato normal)"}, ...] }
          - Si un ítem de lista tiene una etiqueta o frase inicial que actúa como título (ej. "Instalación:", "Punto A:"), esta debe ir en el campo "itemLabelHTML" y estar en negrita (ej: "<strong>Instalación:</strong>").
          - El texto descriptivo principal que sigue a esta etiqueta/título debe ir en el campo "description" y estar en formato normal.
          - Si el ítem es solo texto sin una etiqueta/título claro, todo el texto debe ir en "description", y "itemLabelHTML" puede omitirse o ser vacío.
          - Ejemplo 1 (con título): Original: 'Instalación: Proceso completado.' -> JSON: { "itemLabelHTML": "<strong>Instalación:</strong>", "description": "Proceso completado." }
          - Ejemplo 2 (solo texto): Original: 'Mantenimiento realizado exitosamente.' -> JSON: { "description": "Mantenimiento realizado exitosamente." }


      Intenta ser lo más preciso posible. El contenido HTML debe ser simple. No generes IDs.
      Si un texto parece un comentario general sobre la participación (y no específico de un grupo o el resumen final del módulo de participación), usa "generalizedParticipationCommentary".

      Texto del documento a analizar:
      ---
      ${documentText}
      ---
    `;
  };

  const transformGeminiResponseToPageData = (geminiData: any): ReportPageData | null => {
    if (!geminiData || typeof geminiData !== 'object') return null;
    if (!currentClient) {
        console.error("Cannot transform Gemini response: No current client selected.");
        return null;
    }

    const newPageId = generateUniqueId('page-imported');
    const reportTitle = typeof geminiData.reportTitle === 'string' ? geminiData.reportTitle : "Informe Importado";
    const modules: Module[] = [];
    const modulesToInsertLater: { module: Module, insertAfterModuleId?: string }[] = [];


    if (Array.isArray(geminiData.modules)) {
      geminiData.modules.forEach((geminiModule: any) => {
        if (!geminiModule || typeof geminiModule.type !== 'string' || !(geminiModule.type in ModuleType)) {
          console.warn("Skipping invalid module from Gemini:", geminiModule);
          return;
        }
        
        const moduleType = geminiModule.type as ModuleType;
        const newModuleId = generateUniqueId(`module-${moduleType.toLowerCase()}`);
        let moduleData: any = {};
        const rawData = geminiModule.data && typeof geminiModule.data === 'object' ? geminiModule.data : {};

        switch (moduleType) {
          case ModuleType.INFO_GRID:
            moduleData.items = (Array.isArray(rawData.items) ? rawData.items : []).map((item: any) => ({
              id: generateUniqueId('info'),
              iconName: item.iconName || 'label_important',
              labelHTML: item.labelHTML || 'Etiqueta:',
              value: item.value || 'Valor',
            } as InfoGridItem));
            break;
          case ModuleType.PARTICIPATION:
            const groups: ParticipationGroupItem[] = [];
            if (Array.isArray(rawData.groups)) {
                rawData.groups.forEach((groupData: any) => {
                    let stats = (Array.isArray(groupData.stats) ? groupData.stats : []).map((stat: any) => {
                        let labelText = (typeof stat.labelText === 'string' ? stat.labelText : 'Métrica').replace(/:$/, '').trim();
                        let valueStr = typeof stat.value === 'string' || typeof stat.value === 'number' ? String(stat.value) : '0';
                        
                        const numericMatch = valueStr.match(/^(\d+)/);
                        if (numericMatch) {
                            valueStr = numericMatch[1];
                        } else { 
                            valueStr = '0'; 
                        }

                        return {
                            id: generateUniqueId('part-stat'),
                            iconName: stat.iconName || 'person',
                            labelText: labelText,
                            value: valueStr,
                        } as ParticipationStatItem;
                    }).slice(0, MAX_STATS_PARTICIPATION);

                    if (stats.length === 0 && Array.isArray(groupData.stats)) {
                         stats.push({id: generateUniqueId('part-stat-default'), iconName: 'person', labelText: 'Asistentes', value: '0'});
                    }

                    groups.push({
                        id: generateUniqueId('part-group'),
                        groupTitle: groupData.groupTitle || undefined,
                        stats: stats,
                        groupSummary: groupData.groupSummary || undefined,
                    });
                });
            }
            if (groups.length === 0) {
                groups.push({
                    id: generateUniqueId('part-group-default'),
                    stats: [{id: generateUniqueId('part-stat-default'), iconName: 'person', labelText: 'Asistentes', value: '0'}],
                });
            }
            moduleData.groups = groups;
            moduleData.overallModuleSummary = rawData.overallModuleSummary || undefined;

            if (rawData.generalizedParticipationCommentary && typeof rawData.generalizedParticipationCommentary === 'string' && rawData.generalizedParticipationCommentary.trim() !== '') {
                const generalizedCommentaryModule: Module<ModuleType.RICH_TEXT> = {
                    id: generateUniqueId('module-rich-text-derived'),
                    type: ModuleType.RICH_TEXT,
                    sectionHeaderHTML: createModuleHeaderFromData(ModuleType.RICH_TEXT, rawData.suggestedTitleForGeneralizedCommentary || "Comentarios Adicionales sobre Participación"),
                    data: { contentHTML: `<p>${rawData.generalizedParticipationCommentary}</p>` }
                };
                modulesToInsertLater.push({ module: generalizedCommentaryModule, insertAfterModuleId: newModuleId });
            }
            break;
          case ModuleType.JORNADA_FORMATIVA:
            moduleData.introduction = rawData.introduction || '';
            moduleData.items = (Array.isArray(rawData.items) ? rawData.items : []).map((item: any) => ({
              id: generateUniqueId('jornada-item'),
              itemLabelHTML: item.itemLabelHTML || undefined, 
              description: item.description || 'Punto de la jornada.', 
            } as JornadaItem));
            break;
          case ModuleType.ASPECTOS_CLAVE:
             moduleData.items = (Array.isArray(rawData.items) ? rawData.items : []).map((item: any) => ({
              id: generateUniqueId('aspecto-item'),
              itemLabelHTML: item.itemLabelHTML || `<strong>Aspecto:</strong>`, 
              description: item.description || 'Descripción.',
            } as AspectosClaveItem));
            break;
          case ModuleType.DESAFIOS_OPORTUNIDADES:
            moduleData.items = (Array.isArray(rawData.items) ? rawData.items : []).map((item: any) => ({
              id: generateUniqueId('desafio-item'),
              itemLabelHTML: item.itemLabelHTML || `<strong>Desafío/Oportunidad:</strong>`, 
              description: item.description || 'Descripción.',
            } as DesafiosOportunidadesItem));
            break;
          case ModuleType.CIERRE_CONCLUSION:
            moduleData.text = rawData.text || 'Conclusión.';
            break;
          case ModuleType.EVIDENCIA_VISUAL:
            moduleData.introText = rawData.introText || 'Evidencia visual del evento.';
            const geminiImageSlots = Array.isArray(rawData.images) ? rawData.images.length : 0;
            moduleData.images = Array(Math.max(1, geminiImageSlots)).fill(null).map(() => ({
                id: generateUniqueId('img-imported'),
                file: undefined,
                previewUrl: undefined
            } as ImageItem));
            break;
          case ModuleType.RICH_TEXT:
            moduleData.contentHTML = rawData.contentHTML || '<p>Contenido importado.</p>';
            break;
          case ModuleType.BULLET_LIST:
            moduleData.listItems = (Array.isArray(rawData.listItems) ? rawData.listItems : []).map((item: any) => ({
              id: generateUniqueId('listitem'),
              itemLabelHTML: item.itemLabelHTML || undefined,
              description: item.description || 'Ítem de lista.',
            } as BulletListItem));
            break;
          default:
            console.warn("Unknown module type from Gemini, creating generic RICH_TEXT:", moduleType);
            modules.push({
                id: newModuleId,
                type: ModuleType.RICH_TEXT,
                sectionHeaderHTML: createModuleHeaderFromData(ModuleType.RICH_TEXT, geminiModule.suggestedSectionHeader || `Contenido Importado (${moduleType})`),
                data: { contentHTML: `<p>Contenido no reconocido para el módulo tipo: ${moduleType}. Datos: ${JSON.stringify(rawData)}</p>` }
            });
            return; 
        }
        
        modules.push({
          id: newModuleId,
          type: moduleType,
          sectionHeaderHTML: createModuleHeaderFromData(moduleType, geminiModule.suggestedSectionHeader),
          data: moduleData,
        });
      });
    }

    modulesToInsertLater.forEach(item => {
        const { module: derivedModule, insertAfterModuleId } = item;
        if (insertAfterModuleId) {
            const targetIndex = modules.findIndex(m => m.id === insertAfterModuleId);
            if (targetIndex !== -1) {
                modules.splice(targetIndex + 1, 0, derivedModule);
            } else {
                modules.push(derivedModule); 
            }
        } else {
            modules.push(derivedModule); 
        }
    });

    return {
      id: newPageId,
      reportTitle,
      clientLogoUrl: currentClient.logoUrl, 
      modules,
    };
  };

  const processDocumentWithGemini = async (text: string) => {
    if (!text.trim()) {
      setImportError("El documento parece estar vacío o no se pudo extraer texto.");
      setImportProgressMessage('');
      setFakeImportProgressPercent(0); 
      return;
    }
    setImportError(null);
    setImportSuccess(null);

    try {
      setImportProgressMessage("Analizando contenido con IA...");
      const prompt = getGeminiPromptForReportExtraction(text);
      const response: GenerateContentResponse = await ai.models.generateContent({
        model: "gemini-2.5-flash-preview-04-17",
        contents: prompt,
        config: {
          responseMimeType: "application/json",
        },
      });
      
      setImportProgressMessage("Estructurando datos del informe...");
      let jsonStr = response.text.trim();
      const fenceRegex = /^```(\w*)?\s*\n?(.*?)\n?\s*```$/s;
      const match = jsonStr.match(fenceRegex);
      if (match && match[2]) {
        jsonStr = match[2].trim();
      }
      
      let parsedData;
      try {
        parsedData = JSON.parse(jsonStr);
      } catch (e) {
        console.error("Failed to parse JSON response from Gemini:", e, "\nRaw response:", jsonStr);
        setImportError("Error al procesar la respuesta del AI. El formato no es JSON válido.");
        setFakeImportProgressPercent(prev => Math.min(prev, 95)); 
        return;
      }

      const newPageData = transformGeminiResponseToPageData(parsedData);
      if (newPageData) {
        setPages([newPageData]); 
        setImportSuccess("El documento ha sido importado y el contenido del informe ha sido actualizado.");
        setImportProgressMessage("¡Importación completada!"); 
        setFakeImportProgressPercent(100);
        setTimeout(() => {
          setImportSuccess(null);
        }, 5000);

      } else {
        setImportError("No se pudo transformar la respuesta del AI en datos de informe válidos.");
        setFakeImportProgressPercent(prev => Math.min(prev, 95)); 
      }

    } catch (error) {
      console.error("Error processing document with Gemini:", error);
      setImportError(`Error al contactar el servicio de AI: ${error instanceof Error ? error.message : String(error)}`);
      setFakeImportProgressPercent(prev => Math.min(prev, 95)); 
    }
  };


  const handleFileImport = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsImporting(true);
    setImportError(null);
    setImportSuccess(null);
    setFakeImportProgressPercent(0); 
    setImportProgressMessage("Leyendo archivo...");

    try {
      let text = '';
      if (file.type === "application/vnd.openxmlformats-officedocument.wordprocessingml.document") { 
        const arrayBuffer = await file.arrayBuffer();
        const result = await mammoth.extractRawText({ arrayBuffer });
        text = result.value;
        setImportProgressMessage("Archivo DOCX leído.");
      } else if (file.type === "application/pdf") {
        const arrayBuffer = await file.arrayBuffer();
        const pdfDoc = await pdfjsLib.getDocument({data: arrayBuffer}).promise;
        const numPages = pdfDoc.numPages;
        let pdfTextParts = [];
        for (let i = 1; i <= numPages; i++) {
          const page = await pdfDoc.getPage(i);
          const textContent = await page.getTextContent();
          pdfTextParts.push(textContent.items.map((item: any) => item.str).join(' '));
        }
        text = pdfTextParts.join('\n\n');
        setImportProgressMessage("Archivo PDF leído.");
      } else {
        setImportError("Tipo de archivo no soportado. Por favor, sube un .docx o .pdf.");
        setIsImporting(false); 
        setImportProgressMessage('');
        if(event.target) event.target.value = ''; 
        return;
      }
      
      if (text.trim()) {
        await processDocumentWithGemini(text);
      } else {
        setImportError("No se pudo extraer texto del documento o el documento está vacío.");
      }
    } catch (error) {
      console.error("Error reading file:", error);
      setImportError(`Error al leer el archivo: ${error instanceof Error ? error.message : String(error)}`);
    } finally {
      setIsImporting(false); 
      if(event.target) event.target.value = ''; 
    }
  };


  if (pages.length === 0 && !isImporting && !isExporting) { 
    return <div className="flex justify-center items-center h-screen text-xl text-gray-500 dark:text-gray-300">Cargando informe...</div>;
  }

  return (
    <div className="min-h-screen bg-slate-100 dark:bg-gray-900 text-gray-800 dark:text-gray-200 font-sans">
      {(isImporting || isExporting) && (
        <div className="fixed inset-0 bg-gray-800 bg-opacity-75 flex flex-col items-center justify-center z-[3000] p-4">
          <MaterialIcon name="hourglass_empty" className="text-6xl text-white animate-spin mb-4" />
          <p className="text-white text-xl mb-2">
            {isImporting ? (importProgressMessage || 'Procesando documento...') : (exportStatusMessage || 'Procesando exportación...')}
          </p>
          {isImporting && (
            <>
            <div className="w-3/4 max-w-md bg-gray-600 rounded-full h-3 dark:bg-gray-700 my-2 shadow-inner">
                <div
                className="bg-teal-500 h-3 rounded-full transition-all duration-300 ease-linear"
                style={{ width: `${fakeImportProgressPercent}%` }}
                ></div>
            </div>
            <p className="text-white text-sm font-mono">{fakeImportProgressPercent}%</p>
            </>
          )}
          {isImporting && importError && <p className="text-red-400 text-sm mt-2">{importError}</p>}
          {isExporting && exportStatusMessage && !exportStatusMessage.toLowerCase().includes("error") && !exportStatusMessage.toLowerCase().includes("éxito") && (
             <div className="w-3/4 max-w-md bg-gray-600 rounded-full h-1.5 dark:bg-gray-700 my-2 shadow-inner overflow-hidden">
                <div className="bg-teal-500 h-1.5 animate-pulse-fast"></div> {/* Simple indeterminate progress */}
             </div>
          )}
           {isExporting && exportStatusMessage && (exportStatusMessage.toLowerCase().includes("error") || exportStatusMessage.toLowerCase().includes("éxito")) && (
             <p className={`text-sm mt-2 ${exportStatusMessage.toLowerCase().includes("error") ? 'text-red-400' : 'text-green-400'}`}>{exportStatusMessage}</p>
          )}
        </div>
      )}
      <ControlsPanel
        clients={AVAILABLE_CLIENTS}
        selectedClientLogoUrl={currentClient?.logoUrl || ''}
        onClientChange={handleClientChange}
        onAddPage={handleAddPage}
        onExportPdf={handleExportPdf}
        onExportPng={handleExportPng}
        onImportDocument={handleFileImport}
      />
      {importError && !isImporting && (
         <div className="fixed bottom-4 right-4 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-md shadow-lg z-[2500]" role="alert">
            <strong className="font-bold">Error de Importación: </strong>
            <span className="block sm:inline">{importError}</span>
            <button onClick={() => setImportError(null)} className="absolute top-0 bottom-0 right-0 px-4 py-3">
                <MaterialIcon name="close" />
            </button>
        </div>
      )}
       {importSuccess && !isImporting && (
         <div className="fixed bottom-4 right-4 bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded-md shadow-lg z-[2500]" role="alert">
            <strong className="font-bold">Éxito: </strong>
            <span className="block sm:inline">{importSuccess}</span>
            <button onClick={() => setImportSuccess(null)} className="absolute top-0 bottom-0 right-0 px-4 py-3">
                <MaterialIcon name="close" />
            </button>
        </div>
      )}
      <main id="pageContainer" className="flex flex-col items-center gap-8 py-8 px-4 print:p-0 print:gap-0">
        {pages.map((page, pageIdx) => (
          <React.Fragment key={page.id}>
            {page.modules.length === 0 && (
                 <div className="w-[calc(100%-120px)] mx-auto my-4 print:hidden relative"> {/* Adjusted width for consistency */}
                    <AddModuleButtonPlacement 
                        pageIndex={pageIdx} 
                        moduleIndex={0} 
                        onAddModule={handleAddModule}
                        activeAddModuleMenu={activeAddModuleMenu}
                        setActiveAddModuleMenu={setActiveAddModuleMenu} 
                    />
                </div>
            )}
            <ReportPageDisplay
              pageData={page}
              pageIndex={pageIdx}
              totalPages={pages.length}
              onDeletePage={handleDeletePage}
              onUpdatePageData={updatePageData}
              onDeleteModule={handleDeleteModule}
              onDuplicateModule={handleDuplicateModule}
              onAddModule={handleAddModule}
              // List Item Handlers
              onAddFieldToInfoGrid={handleAddFieldToInfoGrid}
              onDeleteItemFromInfoGrid={handleDeleteItemFromInfoGrid}
              onAddPointToJornadaFormativa={handleAddPointToJornadaFormativa}
              onDeleteItemFromJornadaFormativa={handleDeleteItemFromJornadaFormativa}
              onAddAspectoClave={handleAddAspectoClave}
              onDeleteItemFromAspectosClave={handleDeleteItemFromAspectosClave}
              onAddDesafioOportunidad={handleAddDesafioOportunidad}
              onDeleteItemFromDesafiosOportunidades={handleDeleteItemFromDesafiosOportunidades}
              onAddBulletListItem={handleAddBulletListItem}
              onDeleteBulletListItem={handleDeleteBulletListItem}
              // Participation module specific handlers
              onAddParticipationGroup={handleAddParticipationGroup}
              onDeleteParticipationGroup={handleDeleteParticipationGroup}
              onAddMetricToGroup={handleAddMetricToGroup}
              onDeleteMetricFromGroup={handleDeleteMetricFromGroup}
              // Evidencia Visual specific handler
              onAddImageToEvidenciaVisualModule={handleAddImageToEvidenciaVisualModule}
              onOpenIconPicker={setIconPicker} 
              setDeepValueInState={setDeepValueInState}
              activeModuleMenuId={activeModuleMenuId}
              setActiveModuleMenuId={setActiveModuleMenuId}
              activeAddModuleMenu={activeAddModuleMenu}
              setActiveAddModuleMenu={setActiveAddModuleMenu}
              maxStatsParticipation={MAX_STATS_PARTICIPATION}
            />
          </React.Fragment>
        ))}
      </main>

      {iconPicker && (
        <IconPickerModal
          icons={MATERIAL_ICONS}
          onSelectIcon={handleIconSelected}
          onClose={() => setIconPicker(null)}
        />
      )}
      {confirmModal && (
        <ConfirmModal
          title={confirmModal.title}
          message={confirmModal.message}
          onConfirm={confirmModal.onConfirm}
          onCancel={() => setConfirmModal(null)}
          confirmButtonText={confirmModal.confirmButtonText}
          cancelButtonText={confirmModal.cancelButtonText}
        />
      )}
    </div>
  );
};

export default App;
<style>
    {`
        @keyframes pulse-fast {
            0%, 100% { transform: translateX(-100%); }
            50% { transform: translateX(100%); }
        }
        .animate-pulse-fast {
            animation: pulse-fast 1.5s infinite ease-in-out;
            width: 40%; /* Adjust width of the moving bar */
        }
    `}
</style>
