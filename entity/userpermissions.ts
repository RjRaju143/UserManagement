// Define the Permission type
export interface Permission {
    name: string;
    codename: string;
}

// Create the permissions array
const permissions: Permission[] = [
    {
        name: "can change user",
        codename: "change_user"
    },
    {
        name: "can add user",
        codename: "add_user"
    },
    {
        name: "can view user",
        codename: "view_user"
    },
    {
        name: "can delete user",
        codename: "delete_user"
    },
    {
        name: "can view groups",
        codename: "view_groups"
    },
    {
        name: "can change groups",
        codename: "change_groups"
    },
];

// Export the permissions array
export default permissions;

