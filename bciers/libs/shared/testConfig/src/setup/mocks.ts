// To return a different value for each test, you can import this file and use mockReturnValue
// to set the return value for the function you want to mock using mockReturnValue
// or mockReturnValueOnce. Example:
//
// import { useRouter } from "@/tests/setup/mocks";
//
// useRouter.mockReturnValue({
//  query: {
//      formSection: "3",
//      operation: "test-operation-id",
//    },
//    replace: vi.fn(),
//  });

import { vi } from 'vitest';

const actionHandler = vi.fn();
const useRouter = vi.fn();
const useParams = vi.fn();
const useSession = vi.fn();
const getServerSession = vi.fn();

export { actionHandler, getServerSession, useRouter, useParams, useSession };
