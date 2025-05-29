

import React, { useState, useRef, useEffect } from 'react';
import { 
    Module, ModuleType, IconPickerTarget, 
    InfoGridModuleData, InfoGridItem, 
    ParticipationModuleData, ParticipationStatItem, ParticipationGroupItem,
    JornadaFormativaModuleData, JornadaItem,
    AspectosClaveModuleData, AspectosClaveItem,
    DesafiosOportunidadesModuleData, DesafiosOportunidadesItem,
    CierreConclusionModuleData,
    EvidenciaVisualModuleData,
    RichTextModuleData,
    BulletListModuleData, BulletListItem
} from './types';
import { EditableField, MaterialIcon, ImagePlaceholder } from './components'; 
import { getModuleIconName, getModuleName, generateUniqueId } from './constants';

const MAX_STATS_PARTICIPATION = 6; // Defined here as it's used directly in ParticipationModule for UI logic

interface ModuleWrapperProps {
  module: Module<any>;
  pageIndex: number;
  moduleIndex: number;
  onDeleteModule: (pageIndex: number, moduleIndex: number) => void;
  onDuplicateModule: (pageIndex: number, moduleIndex: number) => void;
  onOpenIconPicker: (target: IconPickerTarget) => void;
  setDeepValueInState: (pageIndex: number, path: string, value: any) => void;
  activeModuleMenuId: string | null;
  setActiveModuleMenuId: (id: string | null) => void;
  
  // List item handlers
  onAddFieldToInfoGrid?: (pageIndex: number, moduleIndex: number) => void;
  onDeleteItemFromInfoGrid?: (pageIndex: number, moduleIndex: number, itemIndex: number) => void;
  onAddPointToJornadaFormativa?: (pageIndex: number, moduleIndex: number) => void;
  onDeleteItemFromJornadaFormativa?: (pageIndex: number, moduleIndex: number, itemIndex: number) => void;
  onAddAspectoClave?: (pageIndex: number, moduleIndex: number) => void;
  onDeleteItemFromAspectosClave?: (pageIndex: number, moduleIndex: number, itemIndex: number) => void;
  onAddDesafioOportunidad?: (pageIndex: number, moduleIndex: number) => void;
  onDeleteItemFromDesafiosOportunidades?: (pageIndex: number, moduleIndex: number, itemIndex: number) => void;
  onAddBulletListItem?: (pageIndex: number, moduleIndex: number) => void;
  onDeleteBulletListItem?: (pageIndex: number, moduleIndex: number, itemIndex: number) => void;

  // Participation specific, passed from App.tsx -> ReportPageDisplay -> ModuleWrapper
  onAddParticipationGroup?: (pageIndex: number, moduleIndex: number) => void;
  onDeleteParticipationGroup?: (pageIndex: number, moduleIndex: number, groupIndex: number) => void;
  onAddMetricToGroup?: (pageIndex: number, moduleIndex: number, groupIndex: number) => void;
  onDeleteMetricFromGroup?: (pageIndex: number, moduleIndex: number, groupIndex: number, statIndex: number) => void;
  
  // Evidencia Visual specific
  onAddImageToEvidenciaVisualModule?: (pageIndex: number, moduleIndex: number) => void;
  
  maxStatsParticipation: number; 
}

export const ModuleWrapper: React.FC<ModuleWrapperProps> = (props) => {
  const { 
    module, pageIndex, moduleIndex, onDeleteModule, onDuplicateModule, 
    onOpenIconPicker, setDeepValueInState,
    activeModuleMenuId, setActiveModuleMenuId,
    onAddFieldToInfoGrid, onDeleteItemFromInfoGrid,
    onAddPointToJornadaFormativa, onDeleteItemFromJornadaFormativa,
    onAddAspectoClave, onDeleteItemFromAspectosClave,
    onAddDesafioOportunidad, onDeleteItemFromDesafiosOportunidades,
    onAddBulletListItem, onDeleteBulletListItem,
    onAddParticipationGroup, 
    onDeleteParticipationGroup, 
    onAddMetricToGroup, 
    onDeleteMetricFromGroup,
    onAddImageToEvidenciaVisualModule,
    maxStatsParticipation 
  } = props;

  const menuId = `module-menu-${module.id}`;
  const isMenuOpen = activeModuleMenuId === module.id;
  const menuRef = useRef<HTMLDivElement>(null);

  const toggleMenu = (e: React.MouseEvent) => {
    e.stopPropagation();
    setActiveModuleMenuId(isMenuOpen ? null : module.id);
  };
  
  const basePath = `modules.${moduleIndex}`;
  const headerIconRegex = /^(<span class='material-icons-round text-xl mr-2 align-middle'>([^<]+)<\/span>)?(.*)$/s;
  const headerMatch = module.sectionHeaderHTML.match(headerIconRegex);
  const parsedIconName = headerMatch && headerMatch[2] ? headerMatch[2] : null;
  const parsedHeaderText = headerMatch && headerMatch[3] !== undefined ? headerMatch[3] : module.sectionHeaderHTML;

  const handleOpenHeaderIconPicker = () => {
    onOpenIconPicker({
        pageIndex,
        path: `${basePath}.sectionHeaderHTML`,
    });
  };

  const handleHeaderTextChange = (newText: string) => {
    const currentFullHeader = module.sectionHeaderHTML;
    const currentMatch = currentFullHeader.match(headerIconRegex);
    let newFullHeaderHtml;
    if (currentMatch && currentMatch[1] && currentMatch[2]) {
        const iconSpan = currentMatch[1]; 
        newFullHeaderHtml = `${iconSpan}${newText}`;
    } else { 
        newFullHeaderHtml = newText;
    }
    setDeepValueInState(pageIndex, `${basePath}.sectionHeaderHTML`, newFullHeaderHtml);
  };
  
  const moduleContent = () => {
    const commonProps = { 
        pageIndex, 
        moduleIndex, 
        basePath: `${basePath}.data`, 
        onOpenIconPicker, 
        setDeepValueInState 
    };

    switch (module.type) {
      case ModuleType.INFO_GRID: 
        return <InfoGridModule 
                    {...commonProps} 
                    data={module.data as InfoGridModuleData} 
                    onDeleteItemFromInfoGrid={onDeleteItemFromInfoGrid!}
                />;
      case ModuleType.PARTICIPATION: 
        return <ParticipationModule 
                    {...commonProps} 
                    data={module.data as ParticipationModuleData}
                    onAddParticipationGroup={onAddParticipationGroup!} 
                    onDeleteParticipationGroup={onDeleteParticipationGroup!}
                    onAddMetricToGroup={onAddMetricToGroup!}
                    onDeleteMetricFromGroup={onDeleteMetricFromGroup!}
                    maxStatsParticipation={maxStatsParticipation}
                />;
      case ModuleType.JORNADA_FORMATIVA: 
        return <JornadaFormativaModule 
                    {...commonProps} 
                    data={module.data as JornadaFormativaModuleData}
                    onDeleteItemFromJornadaFormativa={onDeleteItemFromJornadaFormativa!}
                />;
      case ModuleType.ASPECTOS_CLAVE: 
        return <AspectosClaveModule 
                    {...commonProps} 
                    data={module.data as AspectosClaveModuleData} 
                    onDeleteItemFromAspectosClave={onDeleteItemFromAspectosClave!}
                />;
      case ModuleType.DESAFIOS_OPORTUNIDADES: 
        return <DesafiosOportunidadesModule 
                    {...commonProps} 
                    data={module.data as DesafiosOportunidadesModuleData} 
                    onDeleteItemFromDesafiosOportunidades={onDeleteItemFromDesafiosOportunidades!}
                />;
      case ModuleType.CIERRE_CONCLUSION: return <CierreConclusionModule {...commonProps} data={module.data as CierreConclusionModuleData} />;
      case ModuleType.EVIDENCIA_VISUAL: return <EvidenciaVisualModule {...commonProps} data={module.data as EvidenciaVisualModuleData} />;
      case ModuleType.RICH_TEXT: return <RichTextModule {...commonProps} data={module.data as RichTextModuleData} />;
      case ModuleType.BULLET_LIST: 
        return <BulletListModule 
                    {...commonProps} 
                    data={module.data as BulletListModuleData} 
                    onDeleteBulletListItem={onDeleteBulletListItem!}
                />;
      default: return <div className="p-4 text-red-500">Módulo desconocido: {module.type}</div>;
    }
  };

  const showHeaderEditor = module.type !== ModuleType.INFO_GRID || (module.type === ModuleType.INFO_GRID && module.sectionHeaderHTML && module.sectionHeaderHTML.trim() !== '');

  return (
    <section 
        className="module-container mb-6 print:mb-4 print:break-inside-avoid relative group/modulewrapper" 
        aria-labelledby={showHeaderEditor ? `module-header-text-${module.id}` : undefined}
        data-module-id={module.id}
        data-module-type={module.type}
    >
      {showHeaderEditor && (
        <div className="flex items-center justify-between mb-3">
            <div 
                className="flex items-center flex-grow text-xl font-semibold border-b border-gray-300 dark:border-gray-600 pb-2"
                style={{ color: 'var(--client-highlight-text)' }} 
            >
                <button
                    onClick={handleOpenHeaderIconPicker}
                    className="p-1 rounded hover:bg-gray-200 dark:hover:bg-gray-700 mr-2 print:hidden focus:outline-none focus:ring-2 ring-offset-1 dark:ring-offset-gray-800 focus:ring-[var(--client-highlight-text)]"
                    title={parsedIconName ? "Cambiar ícono del encabezado" : "Añadir ícono al encabezado"}
                    aria-label={parsedIconName ? "Cambiar ícono del encabezado" : "Añadir ícono al encabezado"}
                >
                    <MaterialIcon 
                        name={parsedIconName || getModuleIconName(module.type) || 'edit_note'}
                        className={`text-xl ${parsedIconName ? '' : 'opacity-60'}`}
                        style={{ color: 'var(--client-highlight-text)' }} 
                    />
                </button>
                <EditableField
                    tagName="h2"
                    html={parsedHeaderText}
                    onChange={handleHeaderTextChange}
                    id={`module-header-text-${module.id}`}
                    placeholder="Título de la sección"
                    containerClassName="flex-grow" 
                    className="p-0 m-0 w-full text-xl font-semibold" 
                    color={'var(--client-highlight-text)'} 
                    suppressToolbar={true} 
                />
            </div>
            <div className="relative ml-2 print:hidden"> 
                <button
                    onClick={toggleMenu}
                    className="module-controls-button p-1.5 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 opacity-0 group-hover/modulewrapper:opacity-100 focus:opacity-100 transition-opacity"
                    aria-expanded={isMenuOpen}
                    aria-controls={menuId}
                    aria-label={`Opciones para módulo ${getModuleName(module.type)}`}
                >
                    <MaterialIcon name="more_vert" size="text-lg" />
                </button>
                {isMenuOpen && (
                    <div
                        ref={menuRef}
                        id={menuId}
                        className="module-menu absolute right-0 mt-1 w-60 bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-md shadow-lg z-10 py-1"
                        role="menu"
                    >
                        {/* Add Item options */}
                        {module.type === ModuleType.INFO_GRID && onAddFieldToInfoGrid && (
                             <button
                                onClick={() => { onAddFieldToInfoGrid(pageIndex, moduleIndex); setActiveModuleMenuId(null); }}
                                className="block w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-600" role="menuitem"
                            > <MaterialIcon name="add_circle_outline" className="mr-2" size="text-sm" /> Añadir Campo
                            </button>
                        )}
                        {module.type === ModuleType.JORNADA_FORMATIVA && onAddPointToJornadaFormativa && (
                             <button
                                onClick={() => { onAddPointToJornadaFormativa(pageIndex, moduleIndex); setActiveModuleMenuId(null); }}
                                className="block w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-600" role="menuitem"
                            > <MaterialIcon name="add_circle_outline" className="mr-2" size="text-sm" /> Añadir Punto a Jornada
                            </button>
                        )}
                        {module.type === ModuleType.ASPECTOS_CLAVE && onAddAspectoClave && (
                             <button
                                onClick={() => { onAddAspectoClave(pageIndex, moduleIndex); setActiveModuleMenuId(null); }}
                                className="block w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-600" role="menuitem"
                            > <MaterialIcon name="add_circle_outline" className="mr-2" size="text-sm" /> Añadir Aspecto Clave
                            </button>
                        )}
                        {module.type === ModuleType.DESAFIOS_OPORTUNIDADES && onAddDesafioOportunidad && (
                             <button
                                onClick={() => { onAddDesafioOportunidad(pageIndex, moduleIndex); setActiveModuleMenuId(null); }}
                                className="block w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-600" role="menuitem"
                            > <MaterialIcon name="add_circle_outline" className="mr-2" size="text-sm" /> Añadir Desafío/Oportunidad
                            </button>
                        )}
                        {module.type === ModuleType.BULLET_LIST && onAddBulletListItem && (
                             <button
                                onClick={() => { onAddBulletListItem(pageIndex, moduleIndex); setActiveModuleMenuId(null); }}
                                className="block w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-600" role="menuitem"
                            > <MaterialIcon name="add_circle_outline" className="mr-2" size="text-sm" /> Añadir Ítem a Lista
                            </button>
                        )}


                        {/* Participation Specific */}
                        {module.type === ModuleType.PARTICIPATION && onAddParticipationGroup && (
                             <button
                                onClick={() => { onAddParticipationGroup(pageIndex, moduleIndex); setActiveModuleMenuId(null); }}
                                className="block w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-600"
                                role="menuitem"
                                title="Añadir nuevo grupo de métricas"
                            >
                                <MaterialIcon name="playlist_add" className="mr-2" size="text-sm" /> Añadir Grupo de Métricas
                            </button>
                        )}
                        {/* Evidencia Visual Specific */}
                        {module.type === ModuleType.EVIDENCIA_VISUAL && onAddImageToEvidenciaVisualModule && (
                             <button
                                onClick={() => { onAddImageToEvidenciaVisualModule(pageIndex, moduleIndex); setActiveModuleMenuId(null); }}
                                className="block w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-600"
                                role="menuitem"
                                title="Añadir nueva imagen al módulo"
                            >
                                <MaterialIcon name="add_photo_alternate" className="mr-2" size="text-sm" /> Añadir Imagen
                            </button>
                        )}
                        {/* General Module Actions */}
                        <button
                            onClick={() => { onDuplicateModule(pageIndex, moduleIndex); setActiveModuleMenuId(null); }}
                            className="block w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-600"
                            role="menuitem"
                        >
                            <MaterialIcon name="content_copy" className="mr-2" size="text-sm" /> Duplicar
                        </button>
                        <button
                            onClick={() => { onDeleteModule(pageIndex, moduleIndex); setActiveModuleMenuId(null); }}
                            className="block w-full text-left px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-700/50 hover:text-red-700 dark:hover:text-red-300"
                            role="menuitem"
                        >
                           <MaterialIcon name="delete_outline" className="mr-2" size="text-sm" /> Eliminar
                        </button>
                    </div>
                )}
            </div>
        </div>
      )}
      
      {module.type === ModuleType.INFO_GRID && (!module.sectionHeaderHTML || module.sectionHeaderHTML.trim() === '') && (
         <div className="absolute top-0 right-0 mt-1 mr-1 print:hidden z-10">
            <button
                onClick={toggleMenu}
                 className="module-controls-button p-1.5 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 opacity-0 group-hover/modulewrapper:opacity-100 focus:opacity-100 transition-opacity"
                aria-expanded={isMenuOpen}
                aria-controls={menuId}
                aria-label={`Opciones para módulo ${getModuleName(module.type)}`}
            >
                <MaterialIcon name="more_vert" size="text-lg" />
            </button>
            {isMenuOpen && (
                 <div
                    ref={menuRef}
                    id={menuId}
                    className="module-menu absolute right-0 mt-1 w-56 bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-md shadow-lg z-10 py-1"
                    role="menu"
                >
                    {onAddFieldToInfoGrid && (
                         <button
                            onClick={() => { onAddFieldToInfoGrid(pageIndex, moduleIndex); setActiveModuleMenuId(null); }}
                            className="block w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-600" role="menuitem"
                        > <MaterialIcon name="add_circle_outline" className="mr-2" size="text-sm" /> Añadir Campo
                        </button>
                    )}
                    <button
                        onClick={() => { onDuplicateModule(pageIndex, moduleIndex); setActiveModuleMenuId(null); }}
                        className="block w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-600"
                        role="menuitem"
                    >
                        <MaterialIcon name="content_copy" className="mr-2" size="text-sm" /> Duplicar
                    </button>
                    <button
                        onClick={() => { onDeleteModule(pageIndex, moduleIndex); setActiveModuleMenuId(null); }}
                        className="block w-full text-left px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-700/50 hover:text-red-700 dark:hover:text-red-300"
                        role="menuitem"
                    >
                       <MaterialIcon name="delete_outline" className="mr-2" size="text-sm" /> Eliminar
                    </button>
                </div>
            )}
        </div>
      )}

      <div className={`module-content-wrapper ${module.type === ModuleType.INFO_GRID ? 'p-4 bg-[var(--client-primary-extra-light)] dark:bg-gray-700/30 rounded-lg shadow-sm' : ''}`}>
        {moduleContent()}
      </div>
    </section>
  );
};

interface BaseModuleProps<DataType> {
  data: DataType;
  pageIndex: number;
  moduleIndex: number; 
  basePath: string; 
  onOpenIconPicker: (target: IconPickerTarget) => void;
  setDeepValueInState: (pageIndex: number, path: string, value: any) => void;
}

interface InfoGridModuleSpecificProps {
    onDeleteItemFromInfoGrid: (pageIndex: number, moduleIndex: number, itemIndex: number) => void;
}
type InfoGridModulePropsCombined = BaseModuleProps<InfoGridModuleData> & InfoGridModuleSpecificProps;

export const InfoGridModule: React.FC<InfoGridModulePropsCombined> = ({ data, pageIndex, moduleIndex, basePath, onOpenIconPicker, setDeepValueInState, onDeleteItemFromInfoGrid }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-2 print:text-[10pt]">
      {data.items.map((item, itemIndex) => (
        <div key={item.id} className="flex items-baseline group/infogriditem relative pr-6"> 
          <button
            onClick={() => onOpenIconPicker({ pageIndex, path: `${basePath}.items.${itemIndex}.iconName` })}
            className="print-hidden rounded hover:bg-gray-500/20 dark:hover:bg-gray-600/30 focus:outline-none focus:ring-1 focus:ring-offset-1 focus:ring-[var(--client-highlight-text)] transition-colors mr-1 p-0.5" 
            aria-label={`Cambiar icono para ${item.labelHTML.replace(/<[^>]+>/g, '')}`}
            title="Cambiar ícono"
          >
            <MaterialIcon 
              name={item.iconName} 
              className="text-lg group-hover/infogriditem:scale-110 transition-transform" 
              style={{ color: 'var(--client-highlight-text)'}}
            />
          </button>
          <EditableField
            tagName="span"
            html={item.labelHTML}
            onChange={(val) => setDeepValueInState(pageIndex, `${basePath}.items.${itemIndex}.labelHTML`, val)}
            containerClassName="w-auto mr-1" 
            className="p-0 text-base leading-relaxed" 
            style={{ color: 'var(--client-highlight-text)' }}
            color={'var(--client-highlight-text)'}
            suppressToolbar={true}
          />
          <EditableField
            tagName="div" 
            html={item.value}
            onChange={(val) => setDeepValueInState(pageIndex, `${basePath}.items.${itemIndex}.value`, val)}
            containerClassName="flex-grow min-w-0" 
            className="font-normal p-0 w-full text-base leading-relaxed" 
            style={{ color: 'var(--client-text-on-primary-extra-light)' }}
            color={'var(--client-text-on-primary-extra-light)'}
            suppressToolbar={true}
          />
          {data.items.length > 1 && (
            <button
              onClick={() => onDeleteItemFromInfoGrid(pageIndex, moduleIndex, itemIndex)}
              className="absolute right-0 top-1/2 transform -translate-y-1/2 ml-2 p-0.5 text-red-500 hover:text-red-700 opacity-0 group-hover/infogriditem:opacity-100 print:hidden transition-opacity"
              title="Eliminar campo"
              aria-label="Eliminar este campo"
            >
              <MaterialIcon name="remove_circle_outline" size="text-base" />
            </button>
          )}
        </div>
      ))}
    </div>
  );
};

interface ParticipationModuleSpecificProps {
    onAddParticipationGroup: (pageIndex: number, moduleIndex: number) => void; 
    onDeleteParticipationGroup: (pageIndex: number, moduleIndex: number, groupIndex: number) => void;
    onAddMetricToGroup: (pageIndex: number, moduleIndex: number, groupIndex: number) => void;
    onDeleteMetricFromGroup: (pageIndex: number, moduleIndex: number, groupIndex: number, statIndex: number) => void;
    maxStatsParticipation: number;
}
type ParticipationModulePropsCombined = BaseModuleProps<ParticipationModuleData> & ParticipationModuleSpecificProps;

export const ParticipationModule: React.FC<ParticipationModulePropsCombined> = ({ 
    data, pageIndex, moduleIndex, basePath, 
    onOpenIconPicker, setDeepValueInState,
    onDeleteParticipationGroup, onAddMetricToGroup, onDeleteMetricFromGroup,
    maxStatsParticipation
}) => {
  const [activeGroupMenuId, setActiveGroupMenuId] = useState<string | null>(null);
  const groupMenuRef = useRef<HTMLDivElement>(null);

  const toggleGroupMenu = (e: React.MouseEvent, groupId: string) => {
    e.stopPropagation();
    setActiveGroupMenuId(activeGroupMenuId === groupId ? null : groupId);
  };
  
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (activeGroupMenuId && groupMenuRef.current && !groupMenuRef.current.contains(event.target as Node)) {
         const clickedOnCurrentMenuButton = (event.target as HTMLElement).closest(`[data-group-menu-button-id="${activeGroupMenuId}"]`);
         if (!clickedOnCurrentMenuButton) {
            setActiveGroupMenuId(null);
         }
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [activeGroupMenuId]);


  return (
    <div className="space-y-6">
        {data.groups.map((group, groupIndex) => (
            <div 
              key={group.id} 
              className="group/participationgroupcard border border-gray-200 dark:border-gray-700 p-4 rounded-lg shadow-sm print:border-none print:p-0 print:shadow-none relative"
            >
                <div className="flex justify-between items-start mb-3">
                    <EditableField
                        tagName="h3"
                        html={group.groupTitle || ''}
                        onChange={(val) => setDeepValueInState(pageIndex, `${basePath}.groups.${groupIndex}.groupTitle`, val)}
                        placeholder={data.groups.length > 1 || group.groupTitle ? "Título del Grupo (opcional)" : ""}
                        className="text-lg font-semibold w-full p-1"
                        color="var(--client-highlight-text)"
                        suppressToolbar={true}
                    />
                    <div className="relative ml-2 print:hidden">
                        <button
                            onClick={(e) => toggleGroupMenu(e, group.id)}
                            data-group-menu-button-id={group.id}
                            className="p-1.5 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 opacity-0 group-hover/participationgroupcard:opacity-100 focus:opacity-100 transition-opacity"
                            aria-expanded={activeGroupMenuId === group.id}
                            aria-controls={`group-menu-${group.id}`}
                            title="Opciones del grupo"
                        >
                            <MaterialIcon name="more_vert" size="text-lg" />
                        </button>
                        {activeGroupMenuId === group.id && (
                             <div
                                ref={groupMenuRef}
                                id={`group-menu-${group.id}`}
                                className="absolute right-0 mt-1 w-56 bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-md shadow-lg z-20 py-1 print:hidden"
                                role="menu"
                            >
                                <button
                                    onClick={() => { 
                                        onAddMetricToGroup(pageIndex, moduleIndex, groupIndex); 
                                        setActiveGroupMenuId(null);
                                    }}
                                    disabled={group.stats.length >= maxStatsParticipation}
                                    className="block w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
                                    role="menuitem"
                                >
                                    <MaterialIcon name="add_circle_outline" className="mr-2" size="text-sm" /> Añadir Métrica al Grupo
                                </button>
                                {data.groups.length > 1 && (
                                    <button
                                        onClick={() => { 
                                            onDeleteParticipationGroup(pageIndex, moduleIndex, groupIndex); 
                                            setActiveGroupMenuId(null); 
                                        }}
                                        className="block w-full text-left px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-700/50 hover:text-red-700 dark:hover:text-red-300"
                                        role="menuitem"
                                    >
                                       <MaterialIcon name="delete_sweep" className="mr-2" size="text-sm" /> Eliminar este Grupo
                                    </button>
                                )}
                            </div>
                        )}
                    </div>
                </div>

                <div className={`my-3 py-4 px-2 rounded-lg shadow-inner bg-[var(--client-primary-extra-light)] dark:bg-gray-700/30 print:bg-transparent export-fix-participation-bg`}>
                    <div className="flex flex-wrap justify-center items-stretch gap-4 print:gap-2">
                        {group.stats.map((stat, statIndex) => (
                            <div 
                                key={stat.id} 
                                className={`relative text-center flex flex-col items-center p-4 rounded-xl bg-white/70 dark:bg-gray-600/50 shadow-md hover:shadow-lg transition-shadow print:shadow-none w-full sm:w-auto sm:min-w-[160px] sm:max-w-[200px] group/participationitem print:p-2 print:min-w-[100px] export-fix-participation-item`}
                            >
                                {group.stats.length > 1 && (
                                    <button
                                        onClick={() => onDeleteMetricFromGroup(pageIndex, moduleIndex, groupIndex, statIndex)}
                                        className="absolute top-1 right-1 bg-red-500/70 text-white rounded-full w-5 h-5 flex items-center justify-center opacity-0 group-hover/participationitem:opacity-100 hover:!opacity-100 hover:bg-red-600 print:hidden transition-all"
                                        title="Eliminar métrica"
                                        aria-label="Eliminar esta métrica"
                                    >
                                        <MaterialIcon name="close" size="text-xs" />
                                    </button>
                                )}
                                <button
                                    onClick={() => onOpenIconPicker({ pageIndex, path: `${basePath}.groups.${groupIndex}.stats.${statIndex}.iconName` })}
                                    className={`w-16 h-16 rounded-full flex items-center justify-center mb-2 shadow-lg print:shadow-md print:w-12 print:h-12 bg-white dark:bg-gray-500 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-400 transition-colors group print-hidden export-fix-participation-icon-button`}
                                    title="Cambiar ícono"
                                    aria-label={`Cambiar ícono para ${stat.labelText}`}
                                >
                                    <MaterialIcon 
                                        name={stat.iconName} 
                                        className={`text-3xl print:text-2xl group-hover/participationitem:scale-110 transition-transform export-fix-participation-icon`}
                                        style={{ color: 'var(--client-highlight-text)' }}
                                    />
                                </button>
                                <EditableField
                                    tagName="div"
                                    html={stat.labelText}
                                    onChange={(val) => setDeepValueInState(pageIndex, `${basePath}.groups.${groupIndex}.stats.${statIndex}.labelText`, val)}
                                    className="text-sm font-semibold print:text-[9pt] mb-0.5 w-full" 
                                    style={{ color: 'var(--client-text-on-primary-extra-light)' }}
                                    color={'var(--client-text-on-primary-extra-light)'}
                                    suppressToolbar={true}
                                />
                                <EditableField
                                    tagName="div"
                                    html={stat.value}
                                    onChange={(val) => setDeepValueInState(pageIndex, `${basePath}.groups.${groupIndex}.stats.${statIndex}.value`, val)}
                                    className="text-4xl font-bold tracking-tight print:text-2xl w-full export-fix-participation-value"  
                                    style={{ color: 'var(--client-highlight-text)' }}
                                    color={'var(--client-highlight-text)'}
                                    suppressToolbar={true}
                                />
                            </div>
                        ))}
                    </div>
                </div>
                
                { (group.groupSummary || typeof group.groupSummary === 'string') && 
                    <EditableField 
                        tagName="p" 
                        html={group.groupSummary} 
                        onChange={(val) => setDeepValueInState(pageIndex, `${basePath}.groups.${groupIndex}.groupSummary`, val)} 
                        placeholder="Resumen específico para este grupo (opcional)"
                        className="text-base print:text-[12pt] leading-relaxed mt-4 w-full" 
                        style={{ color: 'var(--client-readable-text-override)' }}
                        color={'var(--client-readable-text-override)'}
                        suppressToolbar={true}
                        isProse={true}
                    />
                }
            </div>
        ))}
        
        { (data.overallModuleSummary || typeof data.overallModuleSummary === 'string') && 
            <div className="mt-6 pt-4 border-t border-gray-300 dark:border-gray-600">
                 <EditableField 
                    tagName="p" 
                    html={data.overallModuleSummary} 
                    onChange={(val) => setDeepValueInState(pageIndex, `${basePath}.overallModuleSummary`, val)} 
                    placeholder="Resumen general del módulo de participación (opcional)"
                    className="text-base print:text-[12pt] leading-relaxed w-full" 
                    style={{ color: 'var(--client-readable-text-override)' }}
                    color={'var(--client-readable-text-override)'}
                    suppressToolbar={true}
                    isProse={true}
                />
            </div>
        }
    </div>
  );
};

interface JornadaFormativaModuleSpecificProps {
    onDeleteItemFromJornadaFormativa: (pageIndex: number, moduleIndex: number, itemIndex: number) => void;
}
type JornadaFormativaModulePropsCombined = BaseModuleProps<JornadaFormativaModuleData> & JornadaFormativaModuleSpecificProps;

export const JornadaFormativaModule: React.FC<JornadaFormativaModulePropsCombined> = ({ data, pageIndex, moduleIndex, basePath, setDeepValueInState, onDeleteItemFromJornadaFormativa }) => {
  return (
    <div>
      <EditableField 
        tagName="p" 
        html={data.introduction} 
        onChange={(val) => setDeepValueInState(pageIndex, `${basePath}.introduction`, val)} 
        className="mb-2 text-base print:text-[12pt] leading-relaxed dark:text-gray-300 w-full" 
        style={{ color: 'var(--client-readable-text-override)' }}
        color={'var(--client-readable-text-override)'}
        suppressToolbar={true}
        isProse={true}
      />
      <ul className="list-disc list-inside pl-1 text-base print:text-[12pt] leading-relaxed">
        {data.items.map((item, itemIndex) => (
          <li key={item.id} className="mb-1.5 group/jornadaitem relative pr-8">
            {item.itemLabelHTML && item.itemLabelHTML.trim() !== '' && (
              <>
                <EditableField
                  tagName="span"
                  html={item.itemLabelHTML}
                  onChange={(val) => setDeepValueInState(pageIndex, `${basePath}.items.${itemIndex}.itemLabelHTML`, val)}
                  containerClassName="inline"
                  className="p-0 mr-1"
                  style={{ color: 'var(--client-highlight-text)' }}
                  color={'var(--client-highlight-text)'}
                  suppressToolbar={true}
                />
                {' '}
              </>
            )}
            <EditableField 
              tagName="span" 
              html={item.description} 
              onChange={(val) => setDeepValueInState(pageIndex, `${basePath}.items.${itemIndex}.description`, val)} 
              containerClassName="inline"
              className="dark:text-gray-300 p-0" 
              style={{ color: 'var(--client-readable-text-override)' }}
              color={'var(--client-readable-text-override)'}
              suppressToolbar={true}
            />
            {data.items.length > 1 && (
                <button
                  onClick={() => onDeleteItemFromJornadaFormativa(pageIndex, moduleIndex, itemIndex)}
                  className="absolute right-0 top-1/2 transform -translate-y-1/2 ml-2 p-0.5 text-red-500 hover:text-red-700 opacity-0 group-hover/jornadaitem:opacity-100 print:hidden transition-opacity"
                  title="Eliminar punto"
                  aria-label="Eliminar este punto"
                >
                  <MaterialIcon name="remove_circle_outline" size="text-base" />
                </button>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
};

interface AspectosClaveModuleSpecificProps {
    onDeleteItemFromAspectosClave: (pageIndex: number, moduleIndex: number, itemIndex: number) => void;
}
type AspectosClaveModulePropsCombined = BaseModuleProps<AspectosClaveModuleData> & AspectosClaveModuleSpecificProps;

export const AspectosClaveModule: React.FC<AspectosClaveModulePropsCombined> = ({ data, pageIndex, moduleIndex, basePath, setDeepValueInState, onDeleteItemFromAspectosClave }) => {
  return (
    <ul className="list-disc pl-5 text-base print:text-[12pt] leading-relaxed">
       {data.items.map((item, itemIndex) => (
         <li key={item.id} className="mb-1.5 group/aspectokeyitem relative pr-8">
            <EditableField 
                 tagName="span"
                 html={item.itemLabelHTML} 
                 onChange={(val) => setDeepValueInState(pageIndex, `${basePath}.items.${itemIndex}.itemLabelHTML`, val)} 
                 containerClassName="inline" 
                 className="p-0 mr-1" 
                 style={{ color: 'var(--client-highlight-text)'}}
                 color={'var(--client-highlight-text)'}
                 suppressToolbar={true}
             />
             {' '} 
             <EditableField 
                 tagName="span" 
                 html={item.description} 
                 onChange={(val) => setDeepValueInState(pageIndex, `${basePath}.items.${itemIndex}.description`, val)} 
                 containerClassName="inline" 
                 className="dark:text-gray-300 p-0" 
                 style={{ color: 'var(--client-readable-text-override)' }}
                 color={'var(--client-readable-text-override)'}
                 suppressToolbar={true}
             />
            {data.items.length > 1 && (
                <button
                  onClick={() => onDeleteItemFromAspectosClave(pageIndex, moduleIndex, itemIndex)}
                  className="absolute right-0 top-1/2 transform -translate-y-1/2 ml-2 p-0.5 text-red-500 hover:text-red-700 opacity-0 group-hover/aspectokeyitem:opacity-100 print:hidden transition-opacity"
                  title="Eliminar aspecto"
                  aria-label="Eliminar este aspecto"
                >
                  <MaterialIcon name="remove_circle_outline" size="text-base" />
                </button>
            )}
         </li>
       ))}
     </ul>
  );
};

interface DesafiosOportunidadesModuleSpecificProps {
    onDeleteItemFromDesafiosOportunidades: (pageIndex: number, moduleIndex: number, itemIndex: number) => void;
}
type DesafiosOportunidadesModulePropsCombined = BaseModuleProps<DesafiosOportunidadesModuleData> & DesafiosOportunidadesModuleSpecificProps;

export const DesafiosOportunidadesModule: React.FC<DesafiosOportunidadesModulePropsCombined> = ({ data, pageIndex, moduleIndex, basePath, setDeepValueInState, onDeleteItemFromDesafiosOportunidades }) => {
  return (
    <ul className="list-disc pl-5 text-base print:text-[12pt] leading-relaxed">
      {data.items.map((item, itemIndex) => (
        <li 
          key={item.id} 
          className="mb-1.5 group/desafioitem relative pr-8"
        >
          <EditableField 
            tagName="span"
            html={item.itemLabelHTML} 
            onChange={(val) => setDeepValueInState(pageIndex, `${basePath}.items.${itemIndex}.itemLabelHTML`, val)} 
            containerClassName="inline"
            className="p-0 mr-1" 
            style={{ color: 'var(--client-highlight-text)'}}
            color={'var(--client-highlight-text)'}
            suppressToolbar={true}
          />
          {' '} 
          <EditableField 
            tagName="span" 
            html={item.description} 
            onChange={(val) => setDeepValueInState(pageIndex, `${basePath}.items.${itemIndex}.description`, val)} 
            containerClassName="inline"
            className="dark:text-gray-300 p-0" 
            style={{ color: 'var(--client-readable-text-override)' }}
            color={'var(--client-readable-text-override)'}
            suppressToolbar={true}
          />
           {data.items.length > 1 && (
                <button
                  onClick={() => onDeleteItemFromDesafiosOportunidades(pageIndex, moduleIndex, itemIndex)}
                  className="absolute right-0 top-1/2 transform -translate-y-1/2 ml-2 p-0.5 text-red-500 hover:text-red-700 opacity-0 group-hover/desafioitem:opacity-100 print:hidden transition-opacity"
                  title="Eliminar desafío/oportunidad"
                  aria-label="Eliminar este desafío u oportunidad"
                >
                  <MaterialIcon name="remove_circle_outline" size="text-base" />
                </button>
            )}
        </li>
      ))}
    </ul>
  );
};

export const CierreConclusionModule: React.FC<BaseModuleProps<CierreConclusionModuleData>> = ({ data, pageIndex, basePath, setDeepValueInState }) => {
  return (
    <EditableField 
        tagName="p" 
        html={data.text} 
        onChange={(val) => setDeepValueInState(pageIndex, `${basePath}.text`, val)} 
        className="text-base print:text-[12pt] leading-relaxed dark:text-gray-300 w-full" 
        style={{ color: 'var(--client-readable-text-override)' }}
        color={'var(--client-readable-text-override)'}
        suppressToolbar={true}
        isProse={true}
    />
  );
};

export const EvidenciaVisualModule: React.FC<BaseModuleProps<EvidenciaVisualModuleData>> = ({ data, pageIndex, basePath, setDeepValueInState }) => {
  
  const handleImageChange = (imageId: string, file: File | null, previewUrl: string | null) => {
    const imageIndex = data.images.findIndex(img => img.id === imageId);
    if (imageIndex !== -1) {
      const updatedImage = { ...data.images[imageIndex], file, previewUrl };
      const newImages = data.images.map((img, idx) => idx === imageIndex ? updatedImage : img);
      setDeepValueInState(pageIndex, `${basePath}.images`, newImages);
    }
  };
  
  return (
    <div>
      <EditableField 
         tagName="p" 
         html={data.introText} 
         onChange={(val) => setDeepValueInState(pageIndex, `${basePath}.introText`, val)} 
         className="mb-3 text-base print:text-[12pt] dark:text-gray-300 w-full" 
         style={{ color: 'var(--client-readable-text-override)' }}
         color={'var(--client-readable-text-override)'}
         suppressToolbar={true}
         isProse={true}
     />
     <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 print:grid-cols-3 print:gap-2">
       {data.images.map((imgItem) => (
         <ImagePlaceholder
           key={imgItem.id}
           imageItem={imgItem}
           onImageChange={handleImageChange}
         />
       ))}
     </div>
    </div>
  );
};

export const RichTextModule: React.FC<BaseModuleProps<RichTextModuleData>> = ({ data, pageIndex, basePath, setDeepValueInState }) => {
  return (
    <EditableField
      tagName="div"
      html={data.contentHTML}
      onChange={(val) => setDeepValueInState(pageIndex, `${basePath}.contentHTML`, val)}
      className="text-base print:text-[12pt] leading-relaxed dark:text-gray-300 w-full" 
      style={{ color: 'var(--client-readable-text-override)' }} 
      color={'var(--client-readable-text-override)'} 
      suppressToolbar={false} 
      isProse={true}
    />
  );
};

interface BulletListModuleSpecificProps {
    onDeleteBulletListItem: (pageIndex: number, moduleIndex: number, itemIndex: number) => void;
}
type BulletListModulePropsCombined = BaseModuleProps<BulletListModuleData> & BulletListModuleSpecificProps;

export const BulletListModule: React.FC<BulletListModulePropsCombined> = ({ data, pageIndex, moduleIndex, basePath, setDeepValueInState, onDeleteBulletListItem }) => {
  return (
    <ul className="list-disc list-inside pl-1 text-base print:text-[12pt] leading-relaxed">
      {data.listItems.map((item, itemIndex) => (
         <li key={item.id} className="mb-1.5 group/bulletitem relative pr-8">
            {item.itemLabelHTML && item.itemLabelHTML.trim() !== '' && (
              <>
                <EditableField
                  tagName="span"
                  html={item.itemLabelHTML}
                  onChange={(val) => setDeepValueInState(pageIndex, `${basePath}.listItems.${itemIndex}.itemLabelHTML`, val)}
                  containerClassName="inline"
                  className="p-0 mr-1"
                  style={{ color: 'var(--client-highlight-text)' }}
                  color={'var(--client-highlight-text)'}
                  suppressToolbar={true}
                />
                {' '}
              </>
            )}
            <EditableField 
              tagName="span" 
              html={item.description} 
              onChange={(val) => setDeepValueInState(pageIndex, `${basePath}.listItems.${itemIndex}.description`, val)} 
              containerClassName="inline"
              className="dark:text-gray-300 p-0" 
              style={{ color: 'var(--client-readable-text-override)' }}
              color={'var(--client-readable-text-override)'}
              suppressToolbar={true}
            />
            {data.listItems.length > 1 && (
                <button
                  onClick={() => onDeleteBulletListItem(pageIndex, moduleIndex, itemIndex)}
                  className="absolute right-0 top-1/2 transform -translate-y-1/2 ml-2 p-0.5 text-red-500 hover:text-red-700 opacity-0 group-hover/bulletitem:opacity-100 print:hidden transition-opacity"
                  title="Eliminar ítem"
                  aria-label="Eliminar este ítem de la lista"
                >
                  <MaterialIcon name="remove_circle_outline" size="text-base" />
                </button>
            )}
        </li>
      ))}
    </ul>
  );
};
