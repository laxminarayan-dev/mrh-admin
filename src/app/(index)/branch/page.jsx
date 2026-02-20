import BranchManager from "../../../components/Branch/BranchManager";

const CreateNewBranchPage = () => {
  return (
    <div className="p-4 bg-white rounded-lg">
      {/* <h1 className="text-2xl font-bold mb-4">Create New Branch</h1>
      <form className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Branch Name
          </label>

          <input
            type="text"
            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-blue-500 focus:border-blue-500"
            placeholder="Enter branch name"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Branch Code
          </label>
          <input
            type="text"
            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-blue-500 focus:border-blue-500"
            placeholder="Enter branch code"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Is Open?
          </label>
          <select className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-blue-500 focus:border-blue-500">
            <option value="true">Yes</option>
            <option value="false">No</option>
          </select>
        </div>
        <button
          type="submit"
          className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition-colors duration-300"
        >
          Create Branch
        </button>
      </form> */}
      {/* Manage Branches */}
      <h1 className="text-2xl font-semibold mb-4">Manage Your Branch</h1>
      <BranchManager />
    </div>
  );
};
export default CreateNewBranchPage;
