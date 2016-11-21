import * as ESTree from 'estree';

import { ICustomNode } from './custom-nodes/ICustomNode';
import { ControlFlowStorage } from '../ControlFlowStorage';

export interface IControlFlowReplacer {
    replace (
        node: ESTree.Node,
        parentNode: ESTree.Node,
        controlFlowStorage: ControlFlowStorage,
        passThroughControlFlowStorage: ControlFlowStorage | undefined,
        controlFlowStorageCustomNodeName: string,
        passThroughControlFlowStorageCustomNodeName: string | undefined
    ): ICustomNode | undefined;
}
