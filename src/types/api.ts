// src/types/api.ts - 后端接口类型定义

// ========== 用户认证相关接口 ==========
export interface RegisterData {
  phone: string;
  email: string;
  password: string;
  purpose?: string;
}

export interface LoginCredentials {
  phone: string;
  password: string;
}

export interface RegisterResponse {
  success: boolean;
  message?: string;
  data?: {
    id: number;
    phone: string;
    email: string;
    purpose?: string;
    isActive: boolean;
    createdAt: string;
  };
}

export interface LoginResponse {
  success: boolean;
  message?: string;
  data?: {
    token: string;
    type: string;
    expiresIn: number;
  };
}

export interface AuthResponse {
  success: boolean;
  message?: string;
  data?: any;
}

// ========== 化合物相关 ==========
export interface Compound {
  id: number;
  name: string;
  englishName: string;
  smiles: string;
  molecularWeight: number;
  logP: number;
  category: string;
  description: string;
  receptorPdb?: string;
  ligandPdbqt?: string;
  rawPdbqtContent?: string;
  heavyAtomCount?: number;
  hbd?: number;
  hba?: number;
  createdAt: string;
}

export interface PageResponse<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  pageable: {
    pageNumber: number;
    pageSize: number;
  };
}

export interface StructureData {
  compoundId: number;
  compoundName: string;
  receptorPdb: string;
  ligandPdbqt: string;
}

export interface RankedCompound {
  id: number;
  name: string;
  englishName: string;
  affinity: number;
  rank: number;
  category: string;
}

export interface Visual3DData {
  proteinPdb: string;
  dockedLigandPdbqt: string;
  bindingEnergy: number;
}

// ========== 通用响应 ==========
export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T | null;
}

// ========== 分子对接结果 ==========
export interface DockingResult {
  id: number;
  compoundId: number;
  affinity: number;
  status: string;
  dockedPdbqtContent: string;
  similarityScore: number;
  updatedAt: string;
}

// ========== ADMET 预测结果 ==========
export interface AdmetResult {
  id: number;
  compoundId: number;
  hergToxicity: number;
  amesToxicity: number;
  liverToxicity: number;
  absorption: number | null;
  metabolism: number | null;
  updatedAt: string;
}

// ========== 基础评分结果 ==========
export interface ScoringResult {
  compoundId: number;
  totalScore: number;
  potencyScore: number;
  safetyScore: number;
  druglikenessScore: number;
  vetoed: boolean;
  adviceTags: string[];
  expertAdvice: string;
}

// ========== 1. 高级评分（AHP+熵权法） ==========
export interface AdvancedScoringResult {
  compoundId: number;
  totalScore: number;
  potencyScore: number;
  safetyScore: number;
  druglikenessScore: number;
  vetoed: boolean;
  weightMethod: string;
  alpha: number;
  mainWeights: number[];
  potencySubWeights: number[];
  safetySubWeights: number[];
  drugLikenessSubWeights: number[];
  potencyDetails: SubScoreDetail[];
  safetyDetails: SubScoreDetail[];
  drugLikenessDetails: SubScoreDetail[];
  adviceTags: string[];
  expertAdvice: string;
}

export interface SubScoreDetail {
  name: string;
  value: string;
  score: number;
  weight: number;
}

export interface WeightInfo {
  method: string;
  alpha: number;
  dimensionNames: string[];
  combinedWeights: number[];
  ahpWeights: number[];
  entropyWeights: number[];
  potencySubWeights: number[];
  safetySubWeights: number[];
  drugLikenessSubWeights: number[];
  description: string;
}

// ========== 2. 类药性评估 ==========
export interface DrugLikenessResult {
  id?: number;
  compoundId: number;
  lipinskiViolations: number;
  veberPass: boolean;
  mwOk: boolean;
  logpOk: boolean;
  hbdOk: boolean;
  hbaOk: boolean;
  rotatableBondsOk: boolean;
  psaOk: boolean;
  overallPass: boolean;
  createdAt?: string;
}

// ========== 3. 结合模式分析 ==========
export interface InteractionResult {
  compoundId: number;
  compoundName: string;
  hydrogenBondCount: number;
  hydrogenBonds: HydrogenBond[];
  hydrophobicCount: number;
  hydrophobicInteractions: HydrophobicInteraction[];
  piPiCount: number;
  piPiStackings: PiPiStacking[];
  saltBridgeCount: number;
  saltBridges: SaltBridge[];
  keyResidues: KeyResidue[];
  bindingPocket: BindingPocket;
  interactionScore: number;
  overallAssessment: string;
  diagramData: InteractionDiagramData;
}

export interface HydrogenBond {
  donorAtom: string;
  donorResidue: string;
  acceptorAtom: string;
  acceptorResidue: string;
  bondLength: number;
  bondAngle: number;
  type: string;
  strength: number;
}

export interface HydrophobicInteraction {
  ligandAtom: string;
  receptorAtom: string;
  residue: string;
  distance: number;
  type: string;
}

export interface PiPiStacking {
  ligandRing: string;
  receptorResidue: string;
  distance: number;
  angle: number;
  type: string;
}

export interface SaltBridge {
  ligandGroup: string;
  receptorResidue: string;
  distance: number;
  type: string;
}

export interface KeyResidue {
  residueName: string;
  residueType: string;
  interactionType: string;
  importance: number;
  description: string;
}

export interface BindingPocket {
  volume: number;
  surfaceArea: number;
  hydrophobicity: string;
  residueCount: number;
  description: string;
}

export interface InteractionDiagramData {
  nodes: DiagramNode[];
  edges: DiagramEdge[];
  ligandStructure: string;
}

export interface DiagramNode {
  id: string;
  label: string;
  x: number;
  y: number;
  color: string;
  type: string;
}

export interface DiagramEdge {
  source: string;
  target: string;
  type: string;
  label: string;
  color: string;
}

// ========== 4. 选择性分析 ==========
export interface SelectivityResult {
  compoundId: number;
  compoundName: string;
  targetKinase: string;
  kinaseResults: KinaseResult[];
  selectivityIndices: SelectivityIndex[];
  profile: SelectivityProfile;
  offTargetRisk: OffTargetRisk;
  selectivityScore: number;
  selectivityLevel: string;
  overallAssessment: string;
}

export interface KinaseResult {
  kinaseName: string;
  kinaseFullName: string;
  pdbId: string;
  description: string;
  affinity: number;
  ki: number;
  status: string;
}

export interface SelectivityIndex {
  offTargetKinase: string;
  siValue: number;
  selectivity: string;
  description: string;
}

export interface SelectivityProfile {
  targetKinase: string;
  kinaseNames: string[];
  affinities: number[];
  relativeActivity: number[];
}

export interface OffTargetRisk {
  highRiskKinases: string[];
  mediumRiskKinases: string[];
  riskLevel: string;
  recommendation: string;
}

// ========== 5. QSAR 预测结果 ==========
export interface QsarResult {
  compoundId: number;
  compoundName: string;
  predictedAffinity: number;
  predictedKi: number;
  confidence: number;
  predictionLevel: string;
  modelType: string;
  modelDescription: string;
  modelR2: number;
  trainingSetSize: number;
  descriptorImportance: DescriptorImportance[];
  sarAnalysis: SarAnalysis;
  similarCompounds: SimilarCompound[];
}

export interface DescriptorImportance {
  descriptorName: string;
  importance: number;
  direction: string;
  description: string;
}

export interface SarAnalysis {
  summary: string;
  keyFeatures: string[];
  favorableFeatures: string[];
  unfavorableFeatures: string[];
  optimizationDirection: string;
}

export interface SimilarCompound {
  name: string;
  similarity: number;
  affinity: number;
  reference: string;
}

// ========== 6. 共识对接 ==========
export interface ConsensusDockingResult {
  compoundId: number;
  compoundName: string;
  overallAssessment: string;
  consensusScore: number;
  confidenceLevel: string;
  confidence: number;
  scoringResults: ScoringFunctionResult[];
  consensusMethod: string;
  consensusAffinity: number;
  rankConsistency: RankConsistency;
  falsePositiveRisk: FalsePositiveRisk;
}

export interface ScoringFunctionResult {
  functionName: string;
  functionFullName: string;
  affinity: number;
  score: number;
  normalizedScore: number;
  weight: number;
  description: string;
}

export interface RankConsistency {
  spearmanCorrelation: number;
  kendallTau: number;
  consistencyLevel: string;
  description: string;
}

export interface FalsePositiveRisk {
  riskLevel: string;
  probability: number;
  riskFactors: string[];
  recommendation: string;
}

// ========== 7. MD模拟 ==========
export interface MdSimulationResult {
  compoundId: number;
  compoundName: string;
  simulationSoftware: string;
  simulationTime: number;
  timeStep: number;
  forceField: string;
  waterModel: string;
  status: string;
  overallAssessment: string;
  stabilityLevel: string;
  stabilityScore: number;
  rmsdAnalysis: RmsdAnalysis;
  rmsfAnalysis: RmsfAnalysis;
  hydrogenBondAnalysis: HydrogenBondAnalysis;
  mmPbsaResult: MmPbsaResult;
  interactionChanges: InteractionChanges;
  visualizationData: MdVisualizationData;
}

export interface RmsdAnalysis {
  proteinRmsdAvg: number;
  proteinRmsdFinal: number;
  ligandRmsdAvg: number;
  ligandRmsdFinal: number;
  complexRmsdAvg: number;
  stabilityAssessment: string;
  timeSeries: TimePoint[];
}

export interface RmsfAnalysis {
  avgRmsf: number;
  maxRmsf: number;
  residueRmsf: ResidueRmsf[];
  flexibleRegions: string[];
  stableRegions: string[];
}

export interface HydrogenBondAnalysis {
  avgHydrogenBonds: number;
  maxHydrogenBonds: number;
  occupancy: number;
  keyHydrogenBonds: HydrogenBondDetail[];
  timeSeries: TimePoint[];
}

export interface MmPbsaResult {
  totalBindingEnergy: number;
  vanDerWaals: number;
  electrostatic: number;
  polarSolvation: number;
  nonpolarSolvation: number;
  entropyContribution: number;
  assessment: string;
}

export interface InteractionChanges {
  stableInteractions: string[];
  lostInteractions: string[];
  newInteractions: string[];
  overallTrend: string;
}

export interface MdVisualizationData {
  rmsdTimeSeries: TimePoint[];
  rmsfData: ResidueRmsf[];
  hBondTimeSeries: TimePoint[];
  finalSnapshotPdb: string;
}

export interface TimePoint {
  time: number;
  value: number;
}

export interface ResidueRmsf {
  residueNumber: number;
  residueName: string;
  rmsf: number;
  region: string;
}

export interface HydrogenBondDetail {
  donorResidue: string;
  acceptorResidue: string;
  occupancy: number;
  avgDistance: number;
  type: string;
}

// ========== 8. Ensemble对接 ==========
export interface EnsembleDockingResult {
  compoundId: number;
  compoundName: string;
  overallAssessment: string;
  ensembleScore: number;
  confidenceLevel: string;
  confidence: number;
  conformerCount: number;
  conformerResults: ConformerResult[];
  ensembleMethod: string;
  bestAffinity: number;
  avgAffinity: number;
  flexibilityAnalysis: FlexibilityAnalysis;
  poseConsistency: PoseConsistency;
}

export interface ConformerResult {
  conformerId: string;
  pdbId: string;
  description: string;
  affinity: number;
  rmsdToReference: number;
  bindingMode: string;
  score: number;
}

export interface FlexibilityAnalysis {
  avgRmsd: number;
  maxRmsd: number;
  flexibleRegions: string[];
  keyResidueMovement: string[];
  flexibilityLevel: string;
}

export interface PoseConsistency {
  avgPoseRmsd: number;
  consistencyLevel: string;
  conservedInteractions: string[];
  variableInteractions: string[];
  description: string;
}

// ========== 9. GNN预测 ==========
export interface GnnPredictionResult {
  compoundId: number;
  compoundName: string;
  predictedAffinity: number;
  predictedKi: number;
  confidence: number;
  predictionLevel: string;
  modelType: string;
  modelDescription: string;
  modelR2: number;
  trainingSetSize: number;
  trainingData: string;
  qsarComparison: QsarComparison;
  attentionWeights: AttentionWeights;
  moleculeGraph: MoleculeGraph;
  featureImportance: GnnFeatureImportance[];
  uncertainty: UncertaintyEstimate;
}

export interface QsarComparison {
  qsarAffinity: number;
  gnnAffinity: number;
  difference: number;
  comparison: string;
  advantage: string;
}

export interface AttentionWeights {
  atomAttentions: AtomAttention[];
  bondAttentions: BondAttention[];
  importantSubstructures: string[];
  interpretation: string;
}

export interface AtomAttention {
  atomIndex: number;
  atomType: string;
  attentionWeight: number;
  role: string;
}

export interface BondAttention {
  bondIndex: number;
  bondType: string;
  attentionWeight: number;
}

export interface MoleculeGraph {
  numAtoms: number;
  numBonds: number;
  atomTypes: string[];
  bondTypes: string[];
  smiles: string;
}

export interface GnnFeatureImportance {
  featureName: string;
  importance: number;
  type: string;
  description: string;
}

export interface UncertaintyEstimate {
  mean: number;
  stdDev: number;
  lowerBound: number;
  upperBound: number;
  uncertaintyLevel: string;
}

// ========== 10. AI分子生成 ==========
export interface MoleculeGenerationResult {
  targetProtein: string;
  generationMethod: string;
  generatedCount: number;
  filteredCount: number;
  parameters: GenerationParameters;
  molecules: GeneratedMolecule[];
  statistics: GenerationStatistics;
  overallAssessment: string;
}

export interface GenerationParameters {
  modelType: string;
  scaffold: string;
  targetSite: string;
  numMolecules: number;
  targetAffinity: number;
  druglikenessFilter: boolean;
  noveltyFilter: boolean;
}

export interface GeneratedMolecule {
  id: number;
  smiles: string;
  name: string;
  predictedAffinity: number;
  predictedKi: number;
  druglikenessScore: number;
  noveltyScore: number;
  diversityScore: number;
  synthesizabilityScore: number;
  overallScore: number;
  molecularWeight: number;
  logP: number;
  hbd: number;
  hba: number;
  tpsa: number;
  rotatableBonds: number;
  scaffold: string;
  keyFeatures: string[];
  advantages: string[];
  risks: string[];
  rank: number;
}

export interface GenerationStatistics {
  avgAffinity: number;
  bestAffinity: number;
  avgDruglikeness: number;
  avgNovelty: number;
  avgDiversity: number;
  avgSynthesizability: number;
  noveltyLevel: string;
  diversityLevel: string;
  scaffoldTypes: string[];
}

// ========== 导航参数 ==========
export type RootStackParamList = {
  Login: { registeredPhone?: string };
  Register: undefined;
  ForgotPassword: undefined;
  Home: undefined;
  Detail: { compound: Compound };
  Report: { compoundId: number; compoundName: string };
};