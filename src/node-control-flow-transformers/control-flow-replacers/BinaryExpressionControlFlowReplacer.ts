import * as escodegen from 'escodegen';
import * as ESTree from 'estree';

import { ICustomNode } from '../../interfaces/custom-nodes/ICustomNode';

import { AbstractControlFlowReplacer } from './AbstractControlFlowReplacer';
import { BinaryExpressionFunctionNode } from '../../custom-nodes/control-flow-replacers-nodes/binary-expression-control-flow-replacer-nodes/BinaryExpressionFunctionNode';
import { ControlFlowStorage } from '../../ControlFlowStorage';
import { ControlFlowStorageCallNode } from '../../custom-nodes/control-flow-replacers-nodes/binary-expression-control-flow-replacer-nodes/ControlFlowStorageCallNode';
import { ControlFlowStoragePassThroughNode } from '../../custom-nodes/control-flow-replacers-nodes/ControlFlowStoragePassThroughNode';

export class BinaryExpressionControlFlowReplacer extends AbstractControlFlowReplacer {
    /**
     * @param expressionNode
     * @returns {string}
     */
    private static getExpressionValue (expressionNode: ESTree.Expression): string {
        return escodegen.generate(expressionNode, {
            sourceMapWithCode: true
        }).code;
    }

    /**
     * @param binaryExpressionNode
     * @param parentNode
     * @param controlFlowStorage
     * @param passThroughControlFlowStorage
     * @param controlFlowStorageCustomNodeName
     * @param passThroughControlFlowStorageCustomNodeName
     * @returns {ICustomNode | undefined}
     */
    public replace (
        binaryExpressionNode: ESTree.BinaryExpression,
        parentNode: ESTree.Node,
        controlFlowStorage: ControlFlowStorage,
        passThroughControlFlowStorage: ControlFlowStorage | undefined,
        controlFlowStorageCustomNodeName: string,
        passThroughControlFlowStorageCustomNodeName: string | undefined
    ): ICustomNode | undefined {
        const rootStorageKey: string = AbstractControlFlowReplacer.getStorageKey();
        const currentStorageKey: string = AbstractControlFlowReplacer.getStorageKey();

        controlFlowStorage.addToStorage(
            rootStorageKey,
            new BinaryExpressionFunctionNode(binaryExpressionNode.operator, this.options)
        );

        if (passThroughControlFlowStorage && passThroughControlFlowStorageCustomNodeName) {
            passThroughControlFlowStorage.addToStorage(
                currentStorageKey,
                new ControlFlowStoragePassThroughNode(controlFlowStorageCustomNodeName, rootStorageKey, this.options)
            );

            return new ControlFlowStorageCallNode(
                passThroughControlFlowStorageCustomNodeName,
                currentStorageKey,
                BinaryExpressionControlFlowReplacer.getExpressionValue(binaryExpressionNode.left),
                BinaryExpressionControlFlowReplacer.getExpressionValue(binaryExpressionNode.right),
                this.options
            );
        } else {
            return new ControlFlowStorageCallNode(
                controlFlowStorageCustomNodeName,
                rootStorageKey,
                BinaryExpressionControlFlowReplacer.getExpressionValue(binaryExpressionNode.left),
                BinaryExpressionControlFlowReplacer.getExpressionValue(binaryExpressionNode.right),
                this.options
            );
        }
    }
}
