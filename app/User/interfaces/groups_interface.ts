export interface CreateGroupRequest {
    name: string;
    isStatic: boolean;
    permissionsIds: number[];
}

export interface CreateGroupResponse {
    status: number;
    id?: number;
    message?: string;
    name?: string;
    permission_ids?: number[];
    static?: boolean;
}

export interface UpdateGroupResponse {
    status: number;
    id?: number;
    message?: string
    name?: string;
    permissions?: (number | undefined)[];
    reporting_to_id?: (number | string);
    groupdetails?: {
        group?: unknown;
        reporting_to?: unknown;
    };
}

