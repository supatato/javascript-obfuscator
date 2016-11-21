import * as estraverse from 'estraverse';
import * as ESTree from 'estree';
import * as format from 'string-template';

import { TNodeWithBlockStatement } from '../../types/TNodeWithBlockStatement';
import { TStatement } from '../../types/TStatement';

import { ICustomNode } from '../../interfaces/custom-nodes/ICustomNode';
import { IOptions } from '../../interfaces/IOptions';

import { AppendState } from '../../enums/AppendState';

import { ControlFlowStorage } from '../../ControlFlowStorage';

import { ControlFlowStorageTemplate } from '../../templates/custom-nodes/control-flow-storage-nodes/ControlFlowStorageTemplate';

import { AbstractCustomNode } from '../AbstractCustomNode';
import { NodeAppender } from '../../node/NodeAppender';
import { Node } from '../../node/Node';
import { NodeUtils } from '../../node/NodeUtils';

export class ControlFlowStorageNode extends AbstractCustomNode {
    /**
     * @type {AppendState}
     */
    protected appendState: AppendState = AppendState.AfterObfuscation;

    /**
     * @type {ControlFlowStorage}
     */
    private controlFlowStorage: ControlFlowStorage;

    /**
     * @type {string}
     */
    private controlFlowStorageName: string;

    /**
     * @param controlFlowStorage
     * @param controlFlowStorageName
     * @param options
     */
    constructor (
        controlFlowStorage: ControlFlowStorage,
        controlFlowStorageName: string,
        options: IOptions
    ) {
        super(options);

        this.controlFlowStorage = controlFlowStorage;
        this.controlFlowStorageName = controlFlowStorageName;
    }

    /**
     * @param blockScopeNode
     */
    public appendNode (blockScopeNode: TNodeWithBlockStatement): void {
        NodeAppender.prependNode(blockScopeNode, this.getNode());
    }

    /**
     * @returns {string}
     */
    public getCode (): string {
        return format(ControlFlowStorageTemplate(), {
            controlFlowStorage: this.controlFlowStorage.toString(),
            controlFlowStorageName: this.controlFlowStorageName
        });
    }

    /**
     * @returns {string}
     */
    public getNodeIdentifier (): string {
        return this.controlFlowStorageName;
    }

    /**
     * @returns {StringArray}
     */
    public getNodeData (): ControlFlowStorage {
        return this.controlFlowStorage;
    }

    /**
     * @returns {TStatement[]}
     */
    protected getNodeStructure (): TStatement[] {
        const nodeStructure: TStatement[] = NodeUtils.convertCodeToStructure(this.getCode());

        nodeStructure.forEach((statement: TStatement) => {
            estraverse.replace(statement, {
                enter: (node: ESTree.Node, parentNode: ESTree.Node): void => {
                    if (!Node.isFunctionExpressionNode(node)) {
                        return;
                    }

                    node.metadata = {};
                    node.metadata.skipByControlFlow = true;
                }
            });
        });

        return nodeStructure;
    }

    /**
     * @param key
     * @param value
     */
    public updateNodeData (key: string, value: ICustomNode): void {
        this.controlFlowStorage.addToStorage(key, value);
    }
}
