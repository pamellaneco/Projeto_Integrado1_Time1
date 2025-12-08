import { ipcMain } from "electron";
import { EmployeeService } from "../preload/services/employee";
import { ScaleService } from "../preload/services/scale";
import { db } from "../database/setup";
import { AuthService } from "../preload/services/auth";

// auth
const auth = new AuthService();

ipcMain.handle('auth-login', async (_event, email, password) => {
  try {
    const token = auth.login(email, password) // lança se inválido
    return { ok: true, token }
  } catch (err) {
    return { ok: false, error: err?.message ?? String(err) }
  }
})

// employee
const employeeService = new EmployeeService(db);

ipcMain.handle('get-all-employees', async (_, params) => {
  return employeeService.getPaginated(params);
});

ipcMain.handle('find-eligible-employees', async (_, params) => {
  try {
    return employeeService.findEligible(params);
  } catch (err) {
    return { error: err?.message ?? String(err) }
  }
});

ipcMain.handle('create-employee', async (_, payload) => {
  employeeService.create(payload);
});

ipcMain.handle('update-employee', async (_, payload) => {
  employeeService.update(payload);
});

ipcMain.handle('delete-employee', async (_, id) => {
  employeeService.delete(id);
});

//scale
const scaleService = new ScaleService(db);

ipcMain.handle('get-scale', async (_, params) => {
  try {
    return scaleService.getScale(params);
  } catch (err) {
    return { error: err?.message ?? String(err) };
  }
});

ipcMain.handle('create-scale', async (_, params) => {
  try {
    return await scaleService.createScale(params);
  } catch (err) {
    return { error: err?.message ?? String(err) };
  }
});

ipcMain.handle('get-day-modal-data', async (_, params) => {
  try {
    return scaleService.getEmployeesForDayModal(params);
  } catch (err) {
    return { error: err?.message ?? String(err) };
  }
});

ipcMain.handle('update-manual-shifts', async (_, params) => {
  try {
    return scaleService.updateManualShifts(params);
  } catch (err) {
    return { error: err?.message ?? String(err) };
  }
});