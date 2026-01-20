import { PatientAPI } from "../endpoints/patientEndpoints";

export const patientService = {
  async getAllPatients() {
    return (await PatientAPI.getAll()).data;
  },
  async createPatient(data) {
    const payload = {
      ...data,
      dob: data.dob ? new Date(data.dob).toISOString() : null,
    };
    return (await PatientAPI.create(payload)).data;
  },
  async updatePatient(id, data) {
    return (await PatientAPI.update(id, data)).data;
  },
  async deletePatient(id) {
    await PatientAPI.delete(id);
    return true;
  }
};