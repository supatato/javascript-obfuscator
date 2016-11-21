import * as estraverse from 'estraverse';
import * as ESTree from 'estree';

import { TControlFlowReplacer } from '../types/TControlFlowReplacer';
import { TStatement } from '../types/TStatement';

import { ICustomNode } from '../interfaces/custom-nodes/ICustomNode';
import { IOptions } from '../interfaces/IOptions';

import { NodeType } from '../enums/NodeType';

import { AbstractNodeControlFlowTransformer } from './AbstractNodeControlFlowTransformer';
import { BinaryExpressionControlFlowReplacer } from './control-flow-replacers/BinaryExpressionControlFlowReplacer';
import { ControlFlowStorage } from '../ControlFlowStorage';
import { ControlFlowStorageNode } from '../custom-nodes/control-flow-storage-nodes/ControlFlowStorageNode';
import { Node } from '../node/Node';
import { NodeAppender } from '../node/NodeAppender';
import { Utils } from '../Utils';
import { NodeUtils } from '../node/NodeUtils';
import { TNodeWithBlockStatement } from '../types/TNodeWithBlockStatement';

export class FunctionControlFlowTransformer extends AbstractNodeControlFlowTransformer {
    /**
     * @type {Map <string, IReplacer>}
     */
    private static controlFlowReplacers: Map <string, TControlFlowReplacer> = new Map <string, TControlFlowReplacer> ([
        [NodeType.BinaryExpression, BinaryExpressionControlFlowReplacer]
    ]);

    /**
     * @param nodes
     * @param options
     */
    constructor(nodes: Map <string, ICustomNode>, options: IOptions) {
        super(nodes, options);
    }

    /**
     * @param functionNode
     */
    public transformNode (functionNode: ESTree.Function): void {
        this.changeFunctionBodyControlFlow(functionNode);
    }

    /**
     * @param functionNode
     */
    private changeFunctionBodyControlFlow (functionNode: ESTree.Function): void {
        if (functionNode.metadata && functionNode.metadata.skipByControlFlow) {
            return;
        }

        if (Node.isArrowFunctionExpressionNode(functionNode)) {
            return;
        }

        const controlFlowStorage: ControlFlowStorage = new ControlFlowStorage();
        const controlFlowStorageCustomNodeName: string = Utils.getRandomVariableName(6);

        const blockScopeNodes: Map <any, any> = new Map();

        estraverse.replace(functionNode.body, {
            enter: (node: ESTree.Node, parentNode: ESTree.Node): any => {
                const controlFlowReplacer: TControlFlowReplacer | undefined = FunctionControlFlowTransformer
                    .controlFlowReplacers.get(node.type);

                if (!controlFlowReplacer) {
                    return;
                }

                const blockScopeOfNode: TNodeWithBlockStatement = NodeUtils.getBlockScopeOfNode(node);

                let passThroughControlFlowStorage: ControlFlowStorage | undefined = undefined;
                let passThroughControlFlowStorageCustomNodeName: string | undefined = undefined;

                if (blockScopeOfNode !== functionNode.body) {
                    if (!blockScopeNodes.has(blockScopeOfNode)) {
                        passThroughControlFlowStorage = new ControlFlowStorage();
                        passThroughControlFlowStorageCustomNodeName = Utils.getRandomVariableName(6);

                        blockScopeNodes.set(blockScopeOfNode, {
                            storage: passThroughControlFlowStorage,
                            name: passThroughControlFlowStorageCustomNodeName
                        });
                    } else {
                        const data: any = blockScopeNodes.get(blockScopeOfNode);

                        passThroughControlFlowStorage = data.storage;
                        passThroughControlFlowStorageCustomNodeName = data.name;
                    }
                }

                const controlFlowStorageCallCustomNode: ICustomNode | undefined = new controlFlowReplacer(
                    this.nodes, this.options
                ).replace(
                    node,
                    parentNode,
                    controlFlowStorage,
                    passThroughControlFlowStorage,
                    controlFlowStorageCustomNodeName,
                    passThroughControlFlowStorageCustomNodeName
                );

                if (!controlFlowStorageCallCustomNode) {
                    return;
                }

                // controlFlowStorageCallCustomNode will always have only one TStatement node,
                // so we can get it by index `0`
                // also we need to return `expression` property of `ExpressionStatement` node because bug:
                // https://github.com/estools/escodegen/issues/289
                const statementNode: TStatement | undefined = controlFlowStorageCallCustomNode.getNode()[0];

                if (!statementNode || !Node.isExpressionStatementNode(statementNode)) {
                    throw new Error(`\`controlFlowStorageCallCustomNode.getNode()\` should returns array with \`ExpressionStatement\` node`);
                }

                return statementNode.expression;
            }
        });

        blockScopeNodes.forEach((data: any, key: any) => {
            const passThroughControlFlowStorageNode: ControlFlowStorageNode = new ControlFlowStorageNode(
                data.storage,
                data.name,
                this.options
            );

            NodeAppender.prependNode(
                key,
                passThroughControlFlowStorageNode.getNode()
            );
        });

        if (!Array.from(controlFlowStorage.getStorage()).length) {
            return;
        }

        const controlFlowStorageCustomNode: ControlFlowStorageNode = new ControlFlowStorageNode(
            controlFlowStorage,
            controlFlowStorageCustomNodeName,
            this.options
        );

        NodeAppender.prependNode(functionNode.body, controlFlowStorageCustomNode.getNode());
    }
}
