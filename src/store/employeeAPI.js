export const getEmployees = async () => {
    try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/employee`);
        if (!response.ok) {
            throw new Error('Failed to fetch employees');
        }
        const data = await response.json();
        return data;
    } catch (error) {
        console.error('Error fetching employees:', error);
        throw error;
    }
};

export const addEmployee = async (employeeData) => {
    try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/employee`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(employeeData),
        });
        console.log('Add employee response:', response);
        if (!response.ok) {
            throw new Error('Failed to add employee');
        }
        const data = await response.json();
        return data;
    } catch (error) {
        console.error('Error adding employee:', error);
        throw error;
    }
};


export const getEmployeeById = async (id) => {
    try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/employee/${id}`);
        if (!response.ok) {

            throw new Error('Failed to fetch employee');
        }
        const data = await response.json();

        return data;
    } catch (error) {
        console.error('Error fetching employee:', error);
        throw error;
    }
};


export const updateEmployee = async (employeeData) => {
    try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/employee/${employeeData._id}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(employeeData),
        });
        console.log('Update employee response:', response);
        if (!response.ok) {
            throw new Error('Failed to update employee');
        }
        const data = await response.json();
        return data;
    }
    catch (error) {
        console.error('Error updating employee:', error);
        throw error;
    }
};

export const deleteEmployee = async (id) => {
    try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/employee/${id}`, {
            method: 'DELETE',
        });
        console.log('Delete employee response:', response);
        if (!response.ok) {
            throw new Error('Failed to delete employee');
        }
        return true;
    } catch (error) {
        console.error('Error deleting employee:', error);
        throw error;
    }
};
