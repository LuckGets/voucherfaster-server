import { ServerApplication } from './ServerApplication';

async function runApplicaion(): Promise<void> {
  const serverApplication: ServerApplication = ServerApplication.new();
  serverApplication.run();
}

runApplicaion();
