import { BlockTransactionObject } from 'web3-eth';

export interface IEthBlock extends IEthBlockGeth {
    date: Date;
}

export interface IEthBlockGeth extends BlockTransactionObject {}
