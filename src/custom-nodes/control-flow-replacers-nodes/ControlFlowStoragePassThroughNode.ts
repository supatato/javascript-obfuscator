import * as format from 'string-template';

import { TNodeWithBlockStatement } from '../../types/TNodeWithBlockStatement';

import { IOptions } from '../../interfaces/IOptions';

import { AppendState } from '../../enums/AppendState';

import { ControlFlowStoragePassThroughTemplate } from '../../templates/custom-nodes/control-flow-replacers-nodes/ControlFlowStoragePassThroughTemplate';

import { AbstractCustomNode } from '../AbstractCustomNode';

export class ControlFlowStoragePassThroughNode extends AbstractCustomNode {
    /**
     * @type {AppendState}
     */
    protected appendState: AppendState = AppendState.BeforeObfuscation;

    /**
     * @type {string}
     */
    private controlFlowStorageCustomNodeName: string;

    /**
     * @type {string}
     */
    private rootStorageKey: string;

    /**
     * @param controlFlowStorageCustomNodeName
     * @param rootStorageKey
     * @param options
     */
    constructor (
        controlFlowStorageCustomNodeName: string,
        rootStorageKey: string,
        options: IOptions
    ) {
        super(options);

        this.controlFlowStorageCustomNodeName = controlFlowStorageCustomNodeName;
        this.rootStorageKey = rootStorageKey;
    }

    /**
     * @param blockScopeNode
     */
    public appendNode (blockScopeNode: TNodeWithBlockStatement): void {}

    /**
     * @returns {string}
     */
    public getCode (): string {
        return format(ControlFlowStoragePassThroughTemplate(), {
            parentControlFlowStorageName: this.controlFlowStorageCustomNodeName,
            parentControlFlowStorageKey: this.rootStorageKey
        });
    }
}
