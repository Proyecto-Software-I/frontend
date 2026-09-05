"use client";

import { useEffect, useMemo, useState } from "react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/features/auth/hooks/auth-provider";

import {
  createOrganizationRole,
  deleteOrganizationRole,
  getOrganizationMembers,
  getOrganizationPermissions,
  getOrganizationRoles,
  replaceMembershipRoles,
  updateOrganizationRole,
} from "../api/organization-rbac-api";
import { getRbacErrorMessage } from "../rbac-error";
import type { OrganizationMember, OrganizationPermission, OrganizationRole } from "../types/rbac";

interface RoleFormState {
  name: string;
  description: string;
  permissionKeys: string[];
}

const emptyRoleForm: RoleFormState = {
  name: "",
  description: "",
  permissionKeys: [],
};

export function OrganizationRolesSettings() {
  const { accessToken, session, refreshSession } = useAuth();
  const [roles, setRoles] = useState<OrganizationRole[]>([]);
  const [permissions, setPermissions] = useState<OrganizationPermission[]>([]);
  const [members, setMembers] = useState<OrganizationMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [creating, setCreating] = useState(false);
  const [editingRoleId, setEditingRoleId] = useState<string | null>(null);
  const [savingEditRoleId, setSavingEditRoleId] = useState<string | null>(null);
  const [deletingRoleId, setDeletingRoleId] = useState<string | null>(null);
  const [createRoleForm, setCreateRoleForm] = useState<RoleFormState>(emptyRoleForm);
  const [editRoleForm, setEditRoleForm] = useState<RoleFormState>(emptyRoleForm);
  const [assignmentSelectionByMember, setAssignmentSelectionByMember] = useState<Record<string, string[]>>({});
  const [assignmentSavingByMember, setAssignmentSavingByMember] = useState<Record<string, boolean>>({});

  const organizationId = session?.activeOrganization?.id;
  const canRead = session?.activeMembership?.permissions.includes("members.read") ?? false;
  const canManage = session?.activeMembership?.permissions.includes("members.manage") ?? false;

  const customRoles = useMemo(
    () => roles.filter((role) => !role.isSystem && role.scope === "ORGANIZATION"),
    [roles],
  );

  const permissionGroups = useMemo(() => {
    const groups = new Map<string, OrganizationPermission[]>();
    permissions.forEach((permission) => {
      const group = permission.key.split(".")[0] ?? "other";
      const current = groups.get(group) ?? [];
      current.push(permission);
      groups.set(group, current);
    });

    return Array.from(groups.entries()).sort(([left], [right]) => left.localeCompare(right));
  }, [permissions]);

  useEffect(() => {
    if (!session?.activeOrganization || !session.activeMembership) {
      return;
    }

    setRoles([]);
    setPermissions([]);
    setMembers([]);
    setAssignmentSelectionByMember({});
    setError(null);
    setNotice(null);

    if (!canRead || !accessToken) {
      setLoading(false);
      return;
    }

    let cancelled = false;

    async function loadData() {
      setLoading(true);
      try {
        const [rolesResponse, permissionsResponse, membersResponse] = await Promise.all([
          getOrganizationRoles(accessToken),
          getOrganizationPermissions(accessToken),
          getOrganizationMembers(accessToken),
        ]);

        if (cancelled) {
          return;
        }

        const organizationRoles = rolesResponse.roles.filter(
          (role) => role.scope === "ORGANIZATION",
        );

        setRoles(organizationRoles);
        setPermissions(permissionsResponse.permissions);
        setMembers(membersResponse.members);
        setAssignmentSelectionByMember(
          buildInitialSelections(membersResponse.members, organizationRoles),
        );
      } catch (requestError: unknown) {
        if (!cancelled) {
          setError(getRbacErrorMessage(requestError));
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    void loadData();

    return () => {
      cancelled = true;
    };
  }, [accessToken, canRead, organizationId, session?.activeMembership, session?.activeOrganization]);

  if (!session?.activeOrganization || !session.activeMembership) {
    return null;
  }

  if (!canRead) {
    return (
      <section className="grid gap-4" aria-labelledby="roles-settings-title">
        <h1 id="roles-settings-title" className="text-3xl font-semibold tracking-tight text-background">
          Roles & permisos
        </h1>
        <Card className="border-background/20 bg-background/5 text-background ring-0">
          <CardContent className="p-6 text-sm text-background/80">
            No tenés permisos para consultar esta administración.
          </CardContent>
        </Card>
      </section>
    );
  }

  async function reloadData() {
    if (!accessToken) {
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const [rolesResponse, permissionsResponse, membersResponse] = await Promise.all([
        getOrganizationRoles(accessToken),
        getOrganizationPermissions(accessToken),
        getOrganizationMembers(accessToken),
      ]);

      const organizationRoles = rolesResponse.roles.filter(
        (role) => role.scope === "ORGANIZATION",
      );

      setRoles(organizationRoles);
      setPermissions(permissionsResponse.permissions);
      setMembers(membersResponse.members);
      setAssignmentSelectionByMember(
        buildInitialSelections(membersResponse.members, organizationRoles),
      );
    } catch (requestError: unknown) {
      setError(getRbacErrorMessage(requestError));
    } finally {
      setLoading(false);
    }
  }

  async function handleCreateRole(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!accessToken || !canManage || creating) {
      return;
    }

    setCreating(true);
    setError(null);
    setNotice(null);

    try {
      await createOrganizationRole(accessToken, {
        name: createRoleForm.name.trim(),
        description: createRoleForm.description.trim(),
        permissionKeys: createRoleForm.permissionKeys,
      });
      setCreateRoleForm(emptyRoleForm);
      await reloadData();
      setNotice("Rol personalizado creado correctamente.");
    } catch (requestError: unknown) {
      setError(getRbacErrorMessage(requestError));
    } finally {
      setCreating(false);
    }
  }

  async function handleUpdateRole(event: React.FormEvent<HTMLFormElement>, role: OrganizationRole) {
    event.preventDefault();
    if (!accessToken || !canManage || savingEditRoleId || role.isSystem) {
      return;
    }

    setSavingEditRoleId(role.id);
    setError(null);
    setNotice(null);

    try {
      await updateOrganizationRole(accessToken, role.id, {
        name: editRoleForm.name.trim(),
        description: editRoleForm.description.trim(),
        permissionKeys: editRoleForm.permissionKeys,
      });

      const shouldRefreshActiveSession = session.activeMembership.roles.includes(role.key);
      setEditingRoleId(null);
      setEditRoleForm(emptyRoleForm);
      await reloadData();
      if (shouldRefreshActiveSession) {
        await refreshSession();
      }
      setNotice("Rol actualizado correctamente.");
    } catch (requestError: unknown) {
      setError(getRbacErrorMessage(requestError));
    } finally {
      setSavingEditRoleId(null);
    }
  }

  async function handleDeleteRole(role: OrganizationRole) {
    if (!accessToken || !canManage || role.isSystem || deletingRoleId) {
      return;
    }

    const confirmed = window.confirm(`¿Eliminar el rol ${role.name}?`);
    if (!confirmed) {
      return;
    }

    setDeletingRoleId(role.id);
    setError(null);
    setNotice(null);

    try {
      await deleteOrganizationRole(accessToken, role.id);
      await reloadData();
      setNotice("Rol eliminado correctamente.");
    } catch (requestError: unknown) {
      setError(getRbacErrorMessage(requestError));
    } finally {
      setDeletingRoleId(null);
    }
  }

  function startEditingRole(role: OrganizationRole) {
    setEditingRoleId(role.id);
    setEditRoleForm({
      name: role.name,
      description: role.description ?? "",
      permissionKeys: role.permissions,
    });
  }

  async function handleSaveMemberRoles(member: OrganizationMember) {
    if (!accessToken || !canManage || assignmentSavingByMember[member.id]) {
      return;
    }

    const selectedRoleIds = assignmentSelectionByMember[member.id] ?? [];
    setAssignmentSavingByMember((previous) => ({ ...previous, [member.id]: true }));
    setError(null);
    setNotice(null);

    try {
      await replaceMembershipRoles(accessToken, member.id, { roleIds: selectedRoleIds });
      await reloadData();
      if (member.id === session.activeMembership.id) {
        await refreshSession();
      }
      setNotice("Roles del miembro actualizados correctamente.");
    } catch (requestError: unknown) {
      setError(getRbacErrorMessage(requestError));
    } finally {
      setAssignmentSavingByMember((previous) => ({ ...previous, [member.id]: false }));
    }
  }

  return (
    <section className="grid gap-6" aria-labelledby="roles-settings-title">
      <header className="grid gap-2">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-background/65">Settings</p>
        <h1 id="roles-settings-title" className="text-3xl font-semibold tracking-tight text-background">
          Roles & permisos
        </h1>
        <p className="text-sm text-background/75">Administrá roles personalizados y permisos por organización activa.</p>
      </header>

      {error ? (
        <p className="rounded-lg border border-destructive/30 bg-destructive/10 p-3 text-sm text-destructive" role="alert" aria-live="assertive">
          {error}
        </p>
      ) : null}

      {notice ? (
        <p className="rounded-lg border border-background/20 bg-background/5 p-3 text-sm text-background" role="status" aria-live="polite">
          {notice}
        </p>
      ) : null}

      {loading ? (
        <Card className="border-background/20 bg-background/5 text-background ring-0">
          <CardContent className="p-6 text-sm text-background/80">Cargando roles y permisos…</CardContent>
        </Card>
      ) : (
        <>
          {canManage ? (
            <Card className="border-background/20 bg-background/5 text-background ring-0">
              <CardHeader>
                <CardTitle>Crear rol personalizado</CardTitle>
              </CardHeader>
              <CardContent>
                <RoleForm
                  form={createRoleForm}
                  permissionsByGroup={permissionGroups}
                  pending={creating}
                  submitLabel="Crear rol"
                  onChange={setCreateRoleForm}
                  onSubmit={handleCreateRole}
                />
              </CardContent>
            </Card>
          ) : null}

          <div className="grid gap-4">
            {roles.length === 0 ? (
              <Card className="border-background/20 bg-background/5 text-background ring-0">
                <CardContent className="p-6 text-sm text-background/80">No hay roles de organización disponibles.</CardContent>
              </Card>
            ) : (
              roles.map((role) => {
                const isEditing = editingRoleId === role.id;
                const isSavingEdit = savingEditRoleId === role.id;
                const isDeleting = deletingRoleId === role.id;

                return (
                  <Card key={role.id} className="border-background/20 bg-background/5 text-background ring-0">
                    <CardHeader className="gap-3">
                      <div className="flex flex-wrap items-center gap-2">
                        <CardTitle className="text-lg">{role.name}</CardTitle>
                        <Badge variant={role.isSystem ? "secondary" : "outline"}>{role.isSystem ? "System" : "Custom"}</Badge>
                        <Badge variant="outline" className="border-background/20 bg-background/10 text-background">{role.key}</Badge>
                      </div>
                      <p className="text-sm text-background/75">{role.description?.trim() ? role.description : "Sin descripción."}</p>
                    </CardHeader>
                    <CardContent className="grid gap-4">
                      <ul className="flex flex-wrap gap-2" aria-label={`Permisos del rol ${role.name}`}>
                        {role.permissions.length > 0 ? (
                          role.permissions.map((permission) => (
                            <li key={permission}>
                              <Badge variant="outline" className="border-background/20 bg-background/10 text-background">{permission}</Badge>
                            </li>
                          ))
                        ) : (
                          <li className="text-sm text-background/70">Sin permisos asignados.</li>
                        )}
                      </ul>

                      {!role.isSystem && canManage ? (
                        <div className="flex flex-wrap gap-2">
                          <Button type="button" variant="secondary" onClick={() => startEditingRole(role)} disabled={isSavingEdit || isDeleting}>
                            Editar
                          </Button>
                          <Button type="button" variant="destructive" onClick={() => void handleDeleteRole(role)} disabled={isDeleting || isSavingEdit}>
                            {isDeleting ? "Eliminando…" : "Eliminar"}
                          </Button>
                        </div>
                      ) : null}

                      {isEditing ? (
                        <RoleForm
                          form={editRoleForm}
                          permissionsByGroup={permissionGroups}
                          pending={isSavingEdit}
                          submitLabel="Guardar cambios"
                          onChange={setEditRoleForm}
                          onSubmit={(event) => void handleUpdateRole(event, role)}
                        />
                      ) : null}
                    </CardContent>
                  </Card>
                );
              })
            )}
          </div>

          <Card className="border-background/20 bg-background/5 text-background ring-0">
            <CardHeader>
              <CardTitle>Asignación de roles a miembros</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-4">
              {members.length === 0 ? (
                <p className="text-sm text-background/80">No hay miembros disponibles.</p>
              ) : (
                members.map((member) => {
                  const pending = assignmentSavingByMember[member.id] === true;
                  const selectedRoleIds = assignmentSelectionByMember[member.id] ?? [];

                  return (
                    <article key={member.id} className="grid gap-3 rounded-lg border border-background/20 p-4">
                      <div className="grid gap-1">
                        <p className="font-medium">
                          {member.user.displayName
                            ?? (`${member.user.firstName ?? ""} ${member.user.lastName ?? ""}`.trim() || member.user.email)}
                        </p>
                        <p className="text-xs text-background/70">{member.user.email}</p>
                        <p className="text-xs text-background/70">Estado: {member.status}</p>
                      </div>
                      {customRoles.length === 0 ? (
                        <p className="text-sm text-background/80">No hay roles custom para asignar.</p>
                      ) : (
                        <fieldset className="grid gap-2" disabled={!canManage || pending}>
                          <legend className="text-sm font-medium">Roles custom</legend>
                          {customRoles.map((role) => {
                            const checked = selectedRoleIds.includes(role.id);

                            return (
                              <label key={`${member.id}-${role.id}`} className="flex items-start gap-2 text-sm">
                                <input
                                  type="checkbox"
                                  checked={checked}
                                  onChange={() => {
                                    setAssignmentSelectionByMember((previous) => {
                                      const current = previous[member.id] ?? [];
                                      const next = checked
                                        ? current.filter((value) => value !== role.id)
                                        : [...current, role.id];

                                      return {
                                        ...previous,
                                        [member.id]: next,
                                      };
                                    });
                                  }}
                                />
                                <span>{role.name} <span className="text-background/70">({role.key})</span></span>
                              </label>
                            );
                          })}
                        </fieldset>
                      )}

                      {canManage ? (
                        <Button
                          type="button"
                          variant="secondary"
                          disabled={pending || customRoles.length === 0}
                          onClick={() => void handleSaveMemberRoles(member)}
                        >
                          {pending ? "Guardando…" : "Guardar roles"}
                        </Button>
                      ) : (
                        <p className="text-xs text-background/70">Solo lectura: no tenés permisos para asignar roles.</p>
                      )}
                    </article>
                  );
                })
              )}
            </CardContent>
          </Card>
        </>
      )}
    </section>
  );
}

function RoleForm({
  form,
  pending,
  submitLabel,
  permissionsByGroup,
  onChange,
  onSubmit,
}: Readonly<{
  form: RoleFormState;
  pending: boolean;
  submitLabel: string;
  permissionsByGroup: Array<[string, OrganizationPermission[]]>;
  onChange: (value: RoleFormState) => void;
  onSubmit: (event: React.FormEvent<HTMLFormElement>) => void;
}>) {
  return (
    <form className="grid gap-4" onSubmit={onSubmit}>
      <label className="grid gap-1 text-sm">
        <span className="font-medium">Nombre</span>
        <input
          required
          disabled={pending}
          value={form.name}
          onChange={(event) => onChange({ ...form, name: event.target.value })}
          className="h-10 rounded-md border border-background/20 bg-foreground px-3 text-background"
        />
      </label>

      <label className="grid gap-1 text-sm">
        <span className="font-medium">Descripción</span>
        <textarea
          disabled={pending}
          value={form.description}
          onChange={(event) => onChange({ ...form, description: event.target.value })}
          className="min-h-20 rounded-md border border-background/20 bg-foreground px-3 py-2 text-background"
        />
      </label>

      <fieldset className="grid gap-3" disabled={pending}>
        <legend className="text-sm font-medium">Permisos</legend>
        {permissionsByGroup.length === 0 ? (
          <p className="text-sm text-background/70">No hay permisos disponibles.</p>
        ) : (
          permissionsByGroup.map(([group, groupPermissions]) => (
            <div key={group} className="grid gap-2 rounded-lg border border-background/20 p-3">
              <p className="text-xs font-semibold uppercase tracking-[0.14em] text-background/70">{group}</p>
              {groupPermissions.map((permission) => {
                const checked = form.permissionKeys.includes(permission.key);

                return (
                  <label key={permission.key} className="flex items-start gap-2 text-sm">
                    <input
                      type="checkbox"
                      checked={checked}
                      onChange={() => {
                        onChange({
                          ...form,
                          permissionKeys: checked
                            ? form.permissionKeys.filter((value) => value !== permission.key)
                            : [...form.permissionKeys, permission.key],
                        });
                      }}
                    />
                    <span>
                      <span>{permission.key}</span>
                      {permission.description ? (
                        <span className="block text-xs text-background/70">{permission.description}</span>
                      ) : null}
                    </span>
                  </label>
                );
              })}
            </div>
          ))
        )}
      </fieldset>

      <Button type="submit" variant="secondary" disabled={pending}>
        {pending ? "Guardando…" : submitLabel}
      </Button>
    </form>
  );
}

function buildInitialSelections(members: OrganizationMember[], roles: OrganizationRole[]) {
  const customRoleIdByKey = new Map(
    roles.filter((role) => !role.isSystem).map((role) => [role.key, role.id]),
  );

  return members.reduce<Record<string, string[]>>((accumulator, member) => {
    accumulator[member.id] = member.roles
      .map((roleKey) => customRoleIdByKey.get(roleKey))
      .filter((roleId): roleId is string => roleId !== undefined);
    return accumulator;
  }, {});
}
