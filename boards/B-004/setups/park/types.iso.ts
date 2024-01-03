export type IIsoStore = {
  sceneState: ISceneState;
  sceneCurrentIds: ISceneCurrentIds;
  sceneConfig: ISceneConfig;
  sceneCameras: ICameras;
  sceneLights: ILights;
  sceneBits: IBits;
  sceneMeshes: IMeshes;
  scenePacks: IPacks;
  sceneVASPs: IVASPs;
  sceneDots: IDots;
  sceneExternals: IExternals;
  sceneAudios: IAudios;
};

export type LockMode = 'dot' | 'inBetween';

export type ISceneState = {
  isLoading: boolean;
  isSceneReady: boolean;
  isAudioReady: boolean;
  isPlaying: boolean;
  freeMove: boolean;
  currentTime: number;
  totalTime: number;
  lockMode: LockMode;
  cue: [number, number];
  currentAudioTimestamp: number;
};

export type ISceneCurrentIds = {
  cameraId: string;
  meshId: string;
  elementId: string;
  groupId: string;
  virtualDotId: string;
  dotId: string;
  layerId: string;
  bitId: string;
  audioId: string;
  focusedBitId: string;
  editId: string;
  modalId: string;
  familyId: string;
  trackId: string;
  elementTypeId: string;
};

export type ISceneConfig = {
  totalDuration: number;
  backgroundColor: IVector4;
  sun: Partial<ISunConfig>;
  cameras: {
    arc: Partial<IArcConfig>;
    free: Partial<IFreeConfig>;
  };
};

export type ICameras = Record<string, ICamera>;

export type Json = Record<string, any>;

export type IBase = {
  id: string;
  label?: string;
  position?: IVector;
  rotation?: IVector;
  scaling?: IVector;
  material?: IMaterial;
  values?: Json;
  isSticky?: boolean;
  enabled?: boolean;
};

export type ICamera = IBase & {
  type: CameraType;
  target?: IVector;
  values?: Json;
};

export type CameraType = 'free' | 'arc';

export type ILight = IBase & {
  type: LightType;
  target?: IVector;
  colors?: IColors;
  values?: Json;
};

export type LightType =
  | 'hemispheric' //
  | 'spotlight'
  | 'directional'
  | 'point';

export type ILights = Record<string, ILight>;

export type BitType = 'basic' | 'skybox' | 'layer';

export type IBit = {
  id: string;
  type: BitType;
  name: string;
  timestamp: number;
  elements: Record<string, boolean>;
  cameraId?: string;
  attachmentUrl?: string;

  // transient
  index?: number;
  start?: number;
  end?: number;
  duration?: number;
  timestampPercent?: number;
  durationPercent?: number;
};

export type IBits = Record<string, IBit>;

export type IDot = {
  id: string;
  bitId: string;
  virtualDotId: 'start' | 'end';
  meshId?: string;
  cameraId?: string;
  values: Json;
  easing?: IEasing;
};

export type IDots = Record<string, IDot>;

export type IExternal = IBase & {
  url: string;
};

export type IExternals = Record<string, IExternal>;

export type IAudio = {
  id: string;
  timestamp: number;
  duration: number;
  url: string;
  values?: Json;
  isMain?: boolean;
};

export type IAudios = Record<string, IAudio>;

export type IMesh = IBase & {
  type: MeshType;
};

export type MeshType =
  | 'ground'
  | 'topography'
  | 'sphere'
  | 'box'
  | 'tiledBox'
  | 'disc'
  | 'icoSphere'
  | 'ribbon'
  | 'cylinder'
  | 'torus'
  | 'torusKnot'
  | 'lines'
  | 'dashedLines'
  | 'lathe'
  | 'tiledPlane'
  | 'plane'
  | 'polygon'
  | 'tube'
  | 'polyhedron'
  | 'geodesic'
  | 'goldberg'
  | 'capsule';

export type IMeshes = Record<string, IMesh>;

//   =========================== helpers ===========================

export type IVector = [number, number, number];
export type IVector4 = [number, number, number, number];
export type IBezier = [number, number, number, number];
export type IEasing = [number, number, number, number];

export type MaterialType = 'color' | 'texture' | 'grid' | 'video';

export type IMaterial = {
  id?: string;
  type: MaterialType;
  colors?: IColors;
  values?: Json;
};

export type IColors = {
  ambient?: IVector;
  specular?: IVector;
  diffuse?: IVector;
  emissive?: IVector;
};

export type IAnimation = {
  id: string;
  from: IKeyframe;
  to: IKeyframe;
  easing?: IBezier;
  duration: number;
};

export type IKeyframe = {
  position?: IVector;
  rotation?: IVector;
  scaling?: IVector;
  alpha?: number;
  beta?: number;
  radius?: number;
  isVisible?: boolean;
};

export type IProperty = keyof IKeyframe;

export type IElement = {
  id: string;
  label: string;
  type: string;
  subtype: string;
  enabled: boolean;
  code: string;
  isVisible: boolean;
  item: IMesh | IExternal | ILight | ICamera;

  // transient
  currentKeyframe?: IKeyframe;
};

export type IBitWithPairs = IBit & {
  elementId: string;
  startDot?: IDot;
  endDot?: IDot;
};

export type AllEntities = {
  allElements: IElement[];
  allBits: IBit[];
  allDots: IDot[];
  currentBitId?: string;
};

export type CursorPos = 'bitStart' | 'bitMiddle' | 'bitEnd' | 'outOfBounds';

export type ICursor = {
  bitId?: string;
  pos: CursorPos;
};

export type ISetPiece = {
  cameraId: string;
  elements: IElement[];
};

export type IPack = {
  id: string;
  index?: number;
  url: string;
  capacity?: number;
  identifier: string;
};

export type IPacks = Record<string, IPack>;

export type VASPType = 'particle' | 'sprite' | 'video' | 'microAnimation';

export type ISprite = IBase & {
  identifier: string;
  packId: string;
  vaspType: 'sprite';
  values: {
    size: Size;
    source: Size;
    isOnGround?: boolean;
  };
  index?: number;
};

export type IVideo = IMesh & {
  identifier: string;
  url: string;
  vaspType: 'video';
  index?: number;
};

export type IMicroAnimation = IBase & {
  identifier: string;
  url: string;
  vaspType: 'microAnimation';
  values: {
    size: number;
    fromFrame: number;
    toFrame: number;
    cellSize: number;
    loop: boolean;
    capacity: number;
    delay: number;
  };
  index?: number;
};

export type IParticle = IBase & {
  identifier: string;
  url: string;
  vaspType: 'particle';
  values: {
    size: number;
    maxLifeTime: number;
    speed: number;
    emitRate: number;
  };
  index?: number;
};

export type IVASP = ISprite | IVideo | IMicroAnimation | IParticle;

export type IVASPs = Record<string, IVASP>;

export type Size = {
  height: number;
  width: number;
};

export type IArcConfig = {
  target: IVector;
  upperRadiusLimit: number;
  alpha: number;
  radius: number;
  lowerBetaLimit: number;
  beta: number;
  lowerRadiusLimit: number;
  upperBetaLimit: number;
};

export type IFreeConfig = {};

export type ISunConfig = {
  intensity: number;
  colors: IColors;
};
