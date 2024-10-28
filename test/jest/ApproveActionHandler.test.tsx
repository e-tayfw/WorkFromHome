import ActionHandler from "@/components/approve/actionHandler";
import axios from "axios";
import Swal from "sweetalert2";
import { toast } from "react-toastify";

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

    test("should send POST request and handle success when user confirms approval", async () => {
      const props = { ...approveHandlerProps };

      const swalResolveValue = {
        isConfirmed: true,
        value: "Approved",
        isDenied: false,
        isDismissed: false,
      };
      (
        Swal.fire as jest.MockedFunction<typeof Swal.fire>
      ).mockResolvedValueOnce(swalResolveValue);

      const axiosResponse = { data: { message: "Approved successfully" } };
      mockedAxios.post.mockResolvedValueOnce(axiosResponse);

      await ActionHandler.handleApprove(props);

      expect(mockedAxios.post).toHaveBeenCalledWith(
        "http://127.0.0.1:8085/api/approveRequest",
        {
          Request_ID: props.requestId,
          Approver_ID: props.approverId,
          Status: "Approved",
          Date_Requested: props.dateRequested,
          Duration: props.duration,
          Reason: "Approved",
        }
      );

      expect(toast.success).toHaveBeenCalledWith("Approved successfully", {
        position: "top-right",
      });
      expect(mockOnRefreshRequests).toHaveBeenCalled();
    });

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

    test("should show error toast when API call fails", async () => {
      const props = { ...approveHandlerProps };

      const swalResolveValue = {
        isConfirmed: true,
        value: "Approved",
        isDenied: false,
        isDismissed: false,
      };
      (
        Swal.fire as jest.MockedFunction<typeof Swal.fire>
      ).mockResolvedValueOnce(swalResolveValue);

      const axiosError = { response: { data: { message: "API Error" } } };
      mockedAxios.post.mockRejectedValueOnce(axiosError);

      await ActionHandler.handleApprove(props);

      expect(toast.error).toHaveBeenCalledWith("API Error", {
        position: "top-right",
      });
      expect(mockOnRefreshRequests).not.toHaveBeenCalled();
    });
  });
});
