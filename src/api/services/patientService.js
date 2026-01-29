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
    // 🔒 Clean + normalize update payload
    const payload = {
      firstName: data.firstName,
      lastName: data.lastName,
      email: data.email,
      phone: data.phone,
      gender: data.gender,
      address: data.address,

      // ✅ convert DOB on update (THIS was missing)
      dob: data.dob ? new Date(data.dob).toISOString() : null,
    };

    return (await PatientAPI.update(id, payload)).data;
  },

  async deletePatient(id) {
    await PatientAPI.delete(id);
    return true;
  },
};