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

