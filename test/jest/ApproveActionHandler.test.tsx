import ActionHandler from "@/components/approve/actionHandler";
import axios from "axios";
import Swal from "sweetalert2";

// Mock axios
jest.mock("axios");
const mockedAxios = axios as jest.Mocked<typeof axios>;

// Mock toast
jest.mock("react-toastify");

// Mock Swal.fire
jest.mock("sweetalert2", () => {
  const fire = jest.fn();
  return {
    __esModule: true,
    default: {
      fire,
    },
  };
});

describe("ActionHandler", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  // Testing handleApprove
  describe("handleApprove", () => {
    const mockOnRefreshRequests = jest.fn();

    const approveHandlerProps = {
      requestId: 1,
      approverId: 2,
      dateRequested: "2023-10-01",
      requestBatch: null,
      duration: "Full Day",
      proportionAfterApproval: 0.4,
      onRefreshRequests: mockOnRefreshRequests,
    };

    test("should not proceed when user cancels approval", async () => {
      const props = { ...approveHandlerProps };

      const swalResolveValue = {
        isConfirmed: false,
        isDenied: false,
        isDismissed: true,
      };
      (
        Swal.fire as jest.MockedFunction<typeof Swal.fire>
      ).mockResolvedValueOnce(swalResolveValue);

      await ActionHandler.handleApprove(props);

      expect(mockedAxios.post).not.toHaveBeenCalled();
      expect(mockOnRefreshRequests).not.toHaveBeenCalled();
    });
  });
});
