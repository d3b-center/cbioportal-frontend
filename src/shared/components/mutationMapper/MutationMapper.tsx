import * as React from 'react';
import Select from 'react-select';
import _ from 'lodash';
import autobind from "autobind-decorator";
import {observer, Observer} from "mobx-react";
import {computed, action, observable} from "mobx";
import classnames from "classnames";
import {
    initDefaultTrackVisibility,
    LollipopMutationPlot,
    TrackDataStatus,
    TrackName,
    TrackVisibility
} from "react-mutation-mapper";

// tslint:disable-next-line:no-import-side-effect
import 'react-select/dist/react-select.css';
import 'react-mutation-mapper/dist/styles.css';
import './styles.scss';

import 'cbioportal-frontend-commons/styles.css';
import 'react-table/react-table.css';

import LoadingIndicator from "shared/components/loadingIndicator/LoadingIndicator";
import StructureViewerPanel from "shared/components/structureViewer/StructureViewerPanel";
import OncoKbEvidenceCache from "shared/cache/OncoKbEvidenceCache";
import PubMedCache from "shared/cache/PubMedCache";
import GenomeNexusCache from "shared/cache/GenomeNexusCache";
import GenomeNexusMyVariantInfoCache from "shared/cache/GenomeNexusMyVariantInfoCache";
import {IMyCancerGenomeData} from "shared/model/MyCancerGenome";
import PdbHeaderCache from "shared/cache/PdbHeaderCache";
import {DEFAULT_PROTEIN_IMPACT_TYPE_COLORS, getColorForProteinImpactType} from "shared/lib/MutationUtils";
import ProteinImpactTypePanel from "shared/components/mutationTypePanel/ProteinImpactTypePanel";
import ProteinChainPanel from "shared/components/proteinChainPanel/ProteinChainPanel";
import MutationMapperStore from "./MutationMapperStore";
import { EnsemblTranscript } from 'shared/api/generated/GenomeNexusAPI';
import {Mutation} from "shared/api/generated/CBioPortalAPI";
import {getNCBIlink} from "public-lib/lib/urls";
import WindowStore from "../window/WindowStore";


export interface IMutationMapperConfig {
    show_oncokb?: boolean;
    show_genomenexus?: boolean;
    show_hotspot?: boolean;
    mycancergenome_show?: boolean;
    show_civic?: boolean;
    isoformOverrideSource?: string;
    mygene_info_url: string | null;
    uniprot_id_url: string | null;
    genomenexus_url: string | null;
    oncokb_public_api_url: string | null;
}

export interface IMutationMapperProps {
    store: MutationMapperStore;
    trackVisibility?: TrackVisibility;
    config: IMutationMapperConfig;
    studyId?: string;
    myCancerGenomeData?: IMyCancerGenomeData;
    oncoKbEvidenceCache?:OncoKbEvidenceCache;
    pdbHeaderCache?: PdbHeaderCache;
    pubMedCache?:PubMedCache;
    genomeNexusCache?:GenomeNexusCache;
    genomeNexusMyVariantInfoCache?:GenomeNexusMyVariantInfoCache;
    showDropDown?: boolean;
    showOnlyAnnotatedTranscriptsInDropdown?: boolean;
}

@observer
export default class MutationMapper<P extends IMutationMapperProps> extends React.Component<P, {}>
{
    @observable protected lollipopPlotGeneX = 0;
    @observable private _trackVisibility: TrackVisibility|undefined;
    //@observable protected geneWidth = 665;

    @computed
    protected get trackVisibility(): TrackVisibility
    {
        if (this.props.trackVisibility) {
            return this.props.trackVisibility!;
        }
        else {
            if (!this._trackVisibility) {
                this._trackVisibility = initDefaultTrackVisibility();
            }

            return this._trackVisibility;
        }
    }

    protected handlers:any;

    constructor(props: P) {
        super(props);

        this.handlers = {
            resetDataStore:()=>{
                this.props.store.dataStore.resetFilterAndSelection();
            },
            onXAxisOffset:action((offset:number)=>{this.lollipopPlotGeneX = offset;})
        };
    }

    @computed get trackDataStatus(): TrackDataStatus
    {
        let oncoKbDataStatus: 'pending' | 'error' | 'complete' | 'empty' = this.props.store.oncoKbData.status;

        if (oncoKbDataStatus === 'complete' && _.isEmpty(this.props.store.oncoKbDataByProteinPosStart)) {
            oncoKbDataStatus = 'empty';
        }

        let hotspotDataStatus: 'pending' | 'error' | 'complete' | 'empty' = this.props.store.indexedHotspotData.status;

        if (hotspotDataStatus === 'complete' && _.isEmpty(this.props.store.hotspotsByPosition)) {
            hotspotDataStatus = 'empty';
        }

        let alignmentDataStatus: 'pending' | 'error' | 'complete' | 'empty' = this.props.store.alignmentData.status;

        if (alignmentDataStatus === 'complete' && this.props.store.pdbChainDataStore.allData.length === 0) {
            alignmentDataStatus = 'empty';
        }

        let ptmDataStatus: 'pending' | 'error' | 'complete' | 'empty' = this.props.store.ptmData.status;

        if (ptmDataStatus === 'complete' &&
            (!this.props.store.ptmData.result || this.props.store.ptmData.result.length === 0)) {
            ptmDataStatus = 'empty';
        }

        return {
            [TrackName.OncoKB]: oncoKbDataStatus,
            [TrackName.CancerHotspots]: hotspotDataStatus,
            [TrackName.PTM]: ptmDataStatus,
            [TrackName.PDB]: alignmentDataStatus
        };
    }

    @computed get geneWidth(){
        return WindowStore.size.width * 0.7 - this.lollipopPlotGeneX;
    }

    @computed get is3dPanelOpen() {
        return this.trackVisibility[TrackName.PDB] === 'visible';
    }

    @computed get geneSummary():JSX.Element {
        const hugoGeneSymbol = this.props.store.gene.hugoGeneSymbol;
        const uniprotId = this.props.store.uniprotId.result;
        const store = this.props.store;
        const showDropDown = this.props.showDropDown;
        const showOnlyAnnotatedTranscriptsInDropdown = this.props.showOnlyAnnotatedTranscriptsInDropdown;
        const canonicalTranscriptId = store.canonicalTranscript.result &&
            store.canonicalTranscript.result.transcriptId;
        const transcript = store.activeTranscript && (store.activeTranscript === canonicalTranscriptId)?
            store.canonicalTranscript.result as EnsemblTranscript :
            store.transcriptsByTranscriptId[store.activeTranscript!!];
        const refseqMrnaId = transcript && transcript.refseqMrnaId;
        const ccdsId = transcript && transcript.ccdsId;

        return (
            <div style={{'paddingBottom':10}}>
                <h4>{hugoGeneSymbol}</h4>
                <Observer>
                    {this.renderDropdown}
                </Observer>
                <div>
                    <span data-test="GeneSummaryRefSeq">{'RefSeq: '}
                        {refseqMrnaId? (
                            <a
                                href={getNCBIlink(`/nuccore/${refseqMrnaId}`)}
                                target="_blank"
                            >
                                {refseqMrnaId}
                            </a>
                        ) : '-'}
                    </span>
                </div>
                {showDropDown? ((store.activeTranscript) && (
                    <div>
                        <span>Ensembl: </span>
                        <a
                            href={`http://grch37.ensembl.org/homo_sapiens/Transcript/Summary?t=${store.activeTranscript}`}
                            target="_blank"
                        >
                            {store.activeTranscript}
                        </a>
                    </div>
                )) : (canonicalTranscriptId && (
                    // down't show drop down, only the canonical transcript
                    <div>
                        <span>Ensembl: </span>
                        <a
                            href={`http://grch37.ensembl.org/homo_sapiens/Transcript/Summary?t=${canonicalTranscriptId}`}
                            target="_blank"
                        >
                            {canonicalTranscriptId}
                        </a>
                    </div>
                ))}
                <div>
                    <span data-test="GeneSummaryCCDS">{'CCDS: '}
                        {ccdsId? (
                            <a
                                href={getNCBIlink({
                                    pathname: '/CCDS/CcdsBrowse.cgi',
                                    query: {
                                        'REQUEST': 'CCDS',
                                        'DATA': ccdsId
                                    }
                                })}
                                target="_blank"
                            >
                                {ccdsId}
                            </a>
                        ) : '-'}
                    </span>
                </div>
                <div>
                    <span data-test="GeneSummaryUniProt">{'UniProt: '}
                        {uniprotId? (
                            <a
                                href={`http://www.uniprot.org/uniprot/${uniprotId}`}
                                target="_blank"
                            >
                                {uniprotId}
                            </a>
                        ) : '-'}
                    </span>
                </div>
            </div>
        );
    }

    @autobind
    private renderDropdown() {
        const hugoGeneSymbol = this.props.store.gene.hugoGeneSymbol;
        const uniprotId = this.props.store.uniprotId.result;
        const store = this.props.store;
        const showDropDown = this.props.showDropDown;
        const showOnlyAnnotatedTranscriptsInDropdown = this.props.showOnlyAnnotatedTranscriptsInDropdown;
        const canonicalTranscriptId = store.canonicalTranscript.result &&
            store.canonicalTranscript.result.transcriptId;
        const transcript = store.activeTranscript && (store.activeTranscript === canonicalTranscriptId)? store.canonicalTranscript.result : store.transcriptsByTranscriptId[store.activeTranscript!!];

        if (!showDropDown) {
            return <span></span>;
        } else if (showOnlyAnnotatedTranscriptsInDropdown) {
            const isLoading = store.transcriptsWithProteinLength.isPending || store.transcriptsWithAnnotations.isPending || store.canonicalTranscript.isPending;
            const requiredData = store.indexedVariantAnnotations.result &&
                                 Object.keys(store.indexedVariantAnnotations.result).length > 0 &&
                                 canonicalTranscriptId &&
                                 store.transcriptsWithAnnotations.result &&
                                 store.transcriptsWithAnnotations.result.length > 0;

            return (
                <div style={{paddingBottom:10}}>
                    <LoadingIndicator isLoading={isLoading} />
                    {(!isLoading && requiredData) && (
                        this.getDropdownTranscripts(store.activeTranscript || canonicalTranscriptId!!,
                                                    store.transcriptsWithAnnotations.result!!,
                                                    canonicalTranscriptId!!,
                                                    store.transcriptsByTranscriptId,
                                                    store.mutationsByTranscriptId)

                    )}
                </div>
            );
        } else {
            // using existing annotations, show all transcripts with
            // protein length
            const isLoading = store.transcriptsWithProteinLength.isPending || store.canonicalTranscript.isPending;
            const requiredData = store.transcriptsWithProteinLength.result &&
                                 store.transcriptsWithProteinLength.result.length > 0 &&
                                 canonicalTranscriptId;
            return (
                <div style={{paddingBottom:10}}>
                    <LoadingIndicator isLoading={isLoading} />
                    {(!isLoading && requiredData) && (
                        this.getDropdownTranscripts(store.activeTranscript || canonicalTranscriptId!!,
                                                    store.transcriptsWithProteinLength.result!!,
                                                    canonicalTranscriptId!!,
                                                    store.transcriptsByTranscriptId)
                    )}
                </div>
            );
        }
    }

    private getDropdownTranscripts(activeTranscript:string ,
                              allTranscripts:string[],
                              canonicalTranscript:string,
                              transcriptsByTranscriptId:{[transcriptId:string]: EnsemblTranscript},
                              mutationsByTranscriptId?: {[transcriptId:string]: Mutation[]}) {
        const activeRefseqMrnaId = transcriptsByTranscriptId[activeTranscript].refseqMrnaId;
        return (
            <div>
                <Select
                    className="transcripts-dropdown-select"
                    value={{
                        label: activeRefseqMrnaId? activeRefseqMrnaId : activeTranscript,
                        value:activeTranscript
                    }}
                    clearable={false}
                    // need to explicitly set delteRemoves for cleable
                    // https://github.com/JedWatson/react-select/issues/1560
                    deleteRemoves={false}
                    style={{width:160}}
                    options={this.sortTranscripts(allTranscripts).map(
                                (t:string) => {
                                    const length = transcriptsByTranscriptId[t].proteinLength;
                                    const refseqMrnaId = transcriptsByTranscriptId[t].refseqMrnaId;
                                    const ccdsId = transcriptsByTranscriptId[t].ccdsId;
                                    const nrOfMutations = mutationsByTranscriptId && mutationsByTranscriptId[t] && mutationsByTranscriptId[t].length;
                                    const label = `${refseqMrnaId? `${refseqMrnaId} / ` : ""}${t} ${ccdsId? `(${ccdsId})` : ""} ${length? `(${length} amino acids)` : ""} ${nrOfMutations? `(${nrOfMutations} mutations)` : ""} ${t === canonicalTranscript? " (default)" : ""}`;
                                    return {label:label,value:t};
                                }
                            )
                    }
                    onChange={(option:any) => {
                        if (option.value) {
                            this.props.store.activeTranscript = option.value;
                            this.close3dPanel();
                        }
                    }}
                />
            </div>
        );
    }

    // No default implementation, child classes should override this
    // TODO provide a generic version of this? See ResultsViewMutationMapper.mutationRateSummary
    get mutationRateSummary():JSX.Element|null {
        return null;
    }

    sortTranscripts(transcripts:string[]) {
        // sort transcripts for dropdown
        // canonical id first
        // then ones with refseq id
        // then protein length
        // lastly the ensembl id
        transcripts = _.orderBy(
            transcripts,
            [
                (t) => this.props.store.canonicalTranscript.result && t === this.props.store.canonicalTranscript.result.transcriptId,
                (t) => this.props.store.transcriptsByTranscriptId[t].hasOwnProperty("refseqMrnaId"),
                (t) => this.props.store.transcriptsByTranscriptId[t].proteinLength,
                (t) => t
            ],
            ['desc','desc','desc','asc']
        );
        return transcripts;
    }

    @computed get multipleMutationInfo(): string {
        const count = this.props.store.dataStore.duplicateMutationCountInMultipleSamples;
        const mutationsLabel = count === 1 ? "mutation" : "mutations";

        return count > 0 ? `: includes ${count} duplicate ${mutationsLabel} in patients with multiple samples` : "";
    }

    @computed get itemsLabelPlural(): string {
        return `Mutations${this.multipleMutationInfo}`;
    }

    protected structureViewerPanel(): JSX.Element|null
    {
        return this.is3dPanelOpen ? (
            <StructureViewerPanel
                mutationDataStore={this.props.store.dataStore}
                pdbChainDataStore={this.props.store.pdbChainDataStore}
                pdbAlignmentIndex={this.props.store.indexedAlignmentData}
                pdbHeaderCache={this.props.pdbHeaderCache}
                residueMappingCache={this.props.store.residueMappingCache}
                uniprotId={this.props.store.uniprotId.result}
                onClose={this.close3dPanel}
                {...DEFAULT_PROTEIN_IMPACT_TYPE_COLORS}
            />
        ): null;
    }

    protected mutationPlot(): JSX.Element|null
    {
        return (
            <LollipopMutationPlot
                store={this.props.store}
                pubMedCache={this.props.pubMedCache}
                onXAxisOffset={this.handlers.onXAxisOffset}
                geneWidth={this.geneWidth}
                trackVisibility={this.trackVisibility}
                trackDataStatus={this.trackDataStatus}
                onTrackVisibilityChange={this.onTrackVisibilityChange}
                getLollipopColor={getColorForProteinImpactType}
            />
        );
    }

    protected proteinChainPanel(): JSX.Element|null
    {
        return this.is3dPanelOpen ? (
            <ProteinChainPanel
                store={this.props.store}
                pdbHeaderCache={this.props.pdbHeaderCache}
                geneWidth={this.geneWidth}
                geneXOffset={this.lollipopPlotGeneX}
                maxChainsHeight={200}
            />
        ): null;
    }

    protected proteinImpactTypePanel(): JSX.Element|null
    {
        return (
            <div>
                <ProteinImpactTypePanel
                    dataStore={this.props.store.dataStore}
                    {...DEFAULT_PROTEIN_IMPACT_TYPE_COLORS}
                />
            </div>
        );
    }

    protected view3dButton(): JSX.Element|null
    {
        return (
            <button
                className="btn btn-default btn-sm"
                disabled={this.props.store.pdbChainDataStore.allData.length === 0}
                onClick={this.toggle3dPanel}
                data-test="view3DStructure"
            >
                View 3D Structure
            </button>
        );
    }

    protected filterResetPanel(): JSX.Element|null
    {
        const dataStore = this.props.store.dataStore;

        return (
            <div className={classnames("alert" , "alert-success")}>
                <span style={{verticalAlign:"middle"}}>
                    {`${dataStore.tableData.length}/${dataStore.allData.length} mutations are shown based on your filtering.`}
                    <button
                        className="btn btn-default btn-xs"
                        style={{cursor:"pointer", marginLeft:6}}
                        onClick={() => dataStore.resetFilterAndSelection()}
                    >
                        Show all mutations
                    </button>
                </span>
            </div>
        );
    }

    protected get isMutationTableDataLoading() {
        // Child classes should override this method
        return false;
    }

    protected mutationTableComponent(): JSX.Element|null
    {
        // Child classes should override this method to return an instance of MutationTable
        return null;
    }

    protected mutationTable(): JSX.Element|null
    {
        return (
            <span>
                {this.mutationTableComponent()}
            </span>
        );
    }

    protected get isMutationPlotDataLoading() {
        return this.props.store.pfamDomainData.isPending;
    }

    protected get isLoading() {
        return this.props.store.mutationData.isPending || this.isMutationPlotDataLoading || this.isMutationTableDataLoading;
    }

    public render() {

        return (
            <div>
                {this.structureViewerPanel()}

                <LoadingIndicator center={true} size="big" isLoading={this.isLoading} />
                {
                    (!this.isLoading) && (
                    <div>
                        {!this.props.store.dataStore.showingAllData &&
                            this.filterResetPanel()
                        }
                        <div style={{ display:'flex' }}>
                            <div className="borderedChart" style={{ marginRight:10 }}>
                                {this.mutationPlot()}
                                {this.proteinChainPanel()}
                            </div>

                            <div className="mutationMapperMetaColumn">
                                {this.geneSummary}
                                {this.mutationRateSummary}
                                {this.proteinImpactTypePanel()}
                                {this.view3dButton()}
                            </div>
                        </div>
                        <hr style={{ marginTop:20 }} />
                        {this.mutationTable()}
                    </div>
                    )
                }
            </div>
        );
    }

    @action
    protected open3dPanel() {
        this.trackVisibility[TrackName.PDB] = 'visible';
    }

    @autobind
    @action
    protected close3dPanel() {
        this.trackVisibility[TrackName.PDB] = 'hidden';
    }

    @autobind
    @action
    protected toggle3dPanel() {
        if (this.is3dPanelOpen) {
            this.close3dPanel();
        } else {
            this.open3dPanel();
        }
    }

    @autobind
    @action
    protected onTrackVisibilityChange(selectedTrackNames: string[])
    {
        // 3D panel is toggled to open
        if (this.trackVisibility[TrackName.PDB] === 'hidden' && selectedTrackNames.includes(TrackName.PDB)) {
            this.open3dPanel();
        }
        // 3D panel is toggled to close
        else if (this.trackVisibility[TrackName.PDB] === 'visible' && !selectedTrackNames.includes(TrackName.PDB)) {
            this.close3dPanel();
        }

        // clear visibility
        Object.keys(this.trackVisibility).forEach(trackName => this.trackVisibility[trackName] = 'hidden');

        // reset visibility values for the visible ones
        selectedTrackNames.forEach(trackName => this.trackVisibility[trackName] = 'visible');
    }
}
