import { PromiseHandler } from '@ts-core/common/promise';
import { DateUtil } from '@ts-core/common/util';
import Web3, * as GLOBAL_WEB3 from 'web3';
import { Contract } from 'web3-eth-contract';
import { IEthBlock } from './IEthBlock';
import { IEthTransaction } from './IEthTransaction';
import { IEthTransactionReceipt } from './IEthTransactionReceipt';
import * as _ from 'lodash';
import { ILogger, LoggerWrapper } from '@ts-core/common/logger';

export class EthApi extends LoggerWrapper {
    // --------------------------------------------------------------------------
    //
    // 	Static Properties
    //
    // --------------------------------------------------------------------------

    public static GAS_FEE_TRANSFER = 21000;

    // --------------------------------------------------------------------------
    //
    // 	Static Methods
    //
    // --------------------------------------------------------------------------

    public static parseBlock(item: IEthBlock): void {
        if (!_.isNil(item)) {
            item.createdDate = DateUtil.parseDate(Number(item.timestamp) * DateUtil.MILISECONDS_SECOND);
        }
    }

    private static get Web3(): any {
        return GLOBAL_WEB3 as any;
    }

    // --------------------------------------------------------------------------
    //
    // 	Private Properties
    //
    // --------------------------------------------------------------------------

    protected _client: Web3;
    protected _contract: Contract;

    // --------------------------------------------------------------------------
    //
    // 	Public Methods
    //
    // --------------------------------------------------------------------------

    constructor(settings: IEthApiSettings, logger?: ILogger) {
        super(logger);

        this._client = new EthApi.Web3(new EthApi.Web3.providers.HttpProvider(settings.endpoint));
        if (!_.isNil(settings.contractAbi) && !_.isNil(settings.contractAddress)) {
            this._contract = this.contractCreate(settings.contractAbi, settings.contractAddress);
        }
    }

    // --------------------------------------------------------------------------
    //
    // 	Public Methods
    //
    // --------------------------------------------------------------------------

    public async sendSignedTransaction(data: string): Promise<IEthTransactionReceipt> {
        return this.client.eth.sendSignedTransaction(data);
    }

    public contractCreate(abi: any, address: string): Contract {
        return new this.client.eth.Contract(abi, address);
    }

    public contractCall<T>(contract: any, name: string, args: Array<any>, options?: any): Promise<T> {
        let promise = PromiseHandler.create<T>();
        contract.methods[name](...args).call(options, (error, data) => {
            if (error) {
                promise.reject(error);
            } else {
                promise.resolve(data);
            }
        });
        return promise.promise;
    }

    public async getBlockNumber(): Promise<number> {
        return this.client.eth.getBlockNumber();
    }

    public async getBlock(block: number | EthApiDefaultBlock, isNeedTransactions?: boolean): Promise<IEthBlock> {
        let item = (await this.client.eth.getBlock(block, isNeedTransactions as any)) as IEthBlock;
        EthApi.parseBlock(item);
        return item;
    }

    public async getBalance(address: string, block: number | EthApiDefaultBlock = EthApiDefaultBlock.LATEST): Promise<string> {
        return this.client.eth.getBalance(address, block);
    }

    public async getGasPrice(): Promise<string> {
        return this.client.eth.getGasPrice();
    }

    public async getTransactionCount(address: string, block?: number): Promise<number> {
        return this.client.eth.getTransactionCount(address, block);
    }

    public async getTransaction(id: string): Promise<IEthTransaction> {
        return this.client.eth.getTransaction(id);
    }

    // --------------------------------------------------------------------------
    //
    // 	Public Properties
    //
    // --------------------------------------------------------------------------

    public get client(): Web3 {
        return this._client;
    }

    public get contract(): Contract {
        return this._contract;
    }
}

export enum EthApiDefaultBlock {
    LATEST = 'latest',
    PENDING = 'pending',
    EARLIEST = 'earliest'
}
export interface IEthApiSettings {
    endpoint: string;
    contractAbi?: any;
    contractAddress?: string;
}
