/**
 * UCAB Tasks - Aplicación Frontend
 * SPA de JavaScript Vanilla para gestión de notas
 */

// =============================================================================
// Configuración de API
// =============================================================================

const API_BASE = '/api/notes';

// =============================================================================
// Gestión de Estado
// =============================================================================

const state = {
    notes: [],
    currentNoteId: null,
    isEditing: false,
    isNewNote: false,
    hasUnsavedChanges: false,
};

// =============================================================================
// Elementos del DOM
// =============================================================================

const elements = {
    notesList: document.getElementById('notesList'),
    noteCount: document.getElementById('noteCount'),
    sortSelect: document.getElementById('sortSelect'),
    btnNewNote: document.getElementById('btnNewNote'),
    btnNewNoteEmpty: document.getElementById('btnNewNoteEmpty'),
    emptyState: document.getElementById('emptyState'),
    noteEditor: document.getElementById('noteEditor'),
    noteTitle: document.getElementById('noteTitle'),
    noteContent: document.getElementById('noteContent'),
    editorMeta: document.getElementById('editorMeta'),
    metaCreated: document.getElementById('metaCreated'),
    metaUpdated: document.getElementById('metaUpdated'),
    editorStatus: document.getElementById('editorStatus'),
    btnSave: document.getElementById('btnSave'),
    btnDelete: document.getElementById('btnDelete'),
    deleteModal: document.getElementById('deleteModal'),
    btnCancelDelete: document.getElementById('btnCancelDelete'),
    btnConfirmDelete: document.getElementById('btnConfirmDelete'),
    toastContainer: document.getElementById('toastContainer'),
};

// =============================================================================
// Funciones de API
// =============================================================================

/**
 * Recupera todas las notas de la API
 * @param {string} sortBy - Campo por el cual ordenar
 * @param {string} order - Orden (asc/desc)
 * @returns {Promise<Array>} Arreglo de notas
 */
async function fetchNotes(sortBy = 'updatedAt', order = 'desc') {
    try {
        const response = await fetch(`${API_BASE}?sortBy=${sortBy}&order=${order}`);
        if (!response.ok) throw new Error('Error al cargar notas');
        return await response.json();
    } catch (error) {
        console.error('fetchNotes error:', error);
        showToast('Error al cargar las notas', 'error');
        return [];
    }
}

/**
 * Recupera una sola nota por ID
 * @param {string} id - ID de la nota
 * @returns {Promise<Object|null>} Objeto de nota o null
 */
async function fetchNoteById(id) {
    try {
        const response = await fetch(`${API_BASE}/${id}`);
        if (!response.ok) throw new Error('Nota no encontrada');
        return await response.json();
    } catch (error) {
        console.error('fetchNoteById error:', error);
        showToast('Error al cargar la nota', 'error');
        return null;
    }
}

/**
 * Crea una nueva nota
 * @param {Object} data - Datos de la nota (título, contenido)
 * @returns {Promise<Object|null>} Nota creada o null
 */
async function createNote(data) {
    try {
        const response = await fetch(API_BASE, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data),
        });
        if (!response.ok) throw new Error('Error al crear nota');
        return await response.json();
    } catch (error) {
        console.error('createNote error:', error);
        showToast('Error al crear la nota', 'error');
        return null;
    }
}

/**
 * Actualiza una nota existente
 * @param {string} id - ID de la nota
 * @param {Object} data - Datos para actualizar
 * @returns {Promise<Object|null>} Nota actualizada o null
 */
async function updateNote(id, data) {
    try {
        const response = await fetch(`${API_BASE}/${id}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data),
        });
        if (!response.ok) throw new Error('Error al actualizar nota');
        return await response.json();
    } catch (error) {
        console.error('updateNote error:', error);
        showToast('Error al guardar la nota', 'error');
        return null;
    }
}

/**
 * Elimina notas por IDs
 * @param {Array<string>} ids - Arreglo de IDs de notas
 * @returns {Promise<Object|null>} Resultado de eliminación o null
 */
async function deleteNotes(ids) {
    try {
        const response = await fetch(API_BASE, {
            method: 'DELETE',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ ids }),
        });
        if (!response.ok) throw new Error('Error al eliminar notas');
        return await response.json();
    } catch (error) {
        console.error('deleteNotes error:', error);
        showToast('Error al eliminar la nota', 'error');
        return null;
    }
}

// =============================================================================
// Funciones de UI
// =============================================================================

/**
 * Formatea una fecha para mostrar
 * @param {string} dateString - Cadena de fecha ISO
 * @returns {string} Fecha formateada
 */
function formatDate(dateString) {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Ahora mismo';
    if (diffMins < 60) return `Hace ${diffMins} min`;
    if (diffHours < 24) return `Hace ${diffHours}h`;
    if (diffDays < 7) return `Hace ${diffDays} días`;

    return date.toLocaleDateString('es-ES', {
        day: 'numeric',
        month: 'short',
        year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined,
    });
}

/**
 * Formatea una fecha completa para mostrar en metadatos
 * @param {string} dateString - Cadena de fecha ISO
 * @returns {string} Fecha formateada
 */
function formatFullDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
    });
}

/**
 * Renderiza la lista de notas en la barra lateral
 */
function renderNotesList() {
    const { notes, currentNoteId } = state;

    if (notes.length === 0) {
        elements.notesList.innerHTML = `
      <div class="empty-list">
        <p style="text-align: center; padding: 20px; color: var(--text-tertiary); font-size: 13px;">
          No hay notas
        </p>
      </div>
    `;
    } else {
        elements.notesList.innerHTML = notes
            .map(
                (note) => `
        <button 
          class="note-item ${note.id === currentNoteId ? 'active' : ''}" 
          data-id="${note.id}"
        >
          <div class="note-item-title">${escapeHtml(note.title) || 'Sin título'}</div>
          <div class="note-item-date">${formatDate(note.updatedAt)}</div>
        </button>
      `
            )
            .join('');
    }

    elements.noteCount.textContent = `${notes.length} nota${notes.length !== 1 ? 's' : ''}`;
}

/**
 * Escapa caracteres especiales HTML
 * @param {string} text - Texto a escapar
 * @returns {string} Texto escapado
 */
function escapeHtml(text) {
    if (!text) return '';
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

/**
 * Muestra el editor de notas con datos
 * @param {Object} note - Nota para mostrar
 */
function showEditor(note) {
    state.currentNoteId = note.id;
    state.hasUnsavedChanges = false;

    elements.noteTitle.value = note.title;
    elements.noteContent.value = note.content;
    elements.metaCreated.textContent = `Creada: ${formatFullDate(note.createdAt)}`;
    elements.metaUpdated.textContent = `Modificada: ${formatFullDate(note.updatedAt)}`;
    elements.editorStatus.textContent = '';
    elements.editorStatus.className = 'editor-status';

    elements.emptyState.classList.add('hidden');
    elements.noteEditor.classList.remove('hidden');

    renderNotesList();
}

/**
 * Oculta el editor y muestra el estado vacío
 */
function hideEditor() {
    state.currentNoteId = null;
    state.hasUnsavedChanges = false;

    elements.noteEditor.classList.add('hidden');
    elements.emptyState.classList.remove('hidden');

    renderNotesList();
}

/**
 * Muestra una notificación toast
 * @param {string} message - Mensaje a mostrar
 * @param {string} type - Tipo de toast (success, error, info)
 */
function showToast(message, type = 'info') {
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.textContent = message;

    elements.toastContainer.appendChild(toast);

    setTimeout(() => {
        toast.style.animation = 'slideIn 0.3s ease reverse';
        setTimeout(() => toast.remove(), 300);
    }, 3000);
}

/**
 * Muestra el modal de confirmación de eliminación
 */
function showDeleteModal() {
    elements.deleteModal.classList.remove('hidden');
}

/**
 * Oculta el modal de confirmación de eliminación
 */
function hideDeleteModal() {
    elements.deleteModal.classList.add('hidden');
}

/**
 * Establece el mensaje de estado del editor
 * @param {string} message - Mensaje de estado
 * @param {string} type - Tipo de estado (saving, saved, error)
 */
function setEditorStatus(message, type = '') {
    elements.editorStatus.textContent = message;
    elements.editorStatus.className = `editor-status ${type}`;
}

// =============================================================================
// Manejadores de Eventos
// =============================================================================

/**
 * Maneja la creación de una nueva nota
 * Muestra el editor vacío - la nota se crea al guardar por primera vez
 */
async function handleNewNote() {
    if (state.hasUnsavedChanges && state.currentNoteId) {
        await handleSave();
    }

    // Establecer estado para nueva nota (aún no guardada)
    state.currentNoteId = null;
    state.isNewNote = true;
    state.hasUnsavedChanges = false;

    // Limpiar y mostrar editor
    elements.noteTitle.value = '';
    elements.noteContent.value = '';
    elements.metaCreated.textContent = '';
    elements.metaUpdated.textContent = '';
    elements.editorMeta.style.display = 'none';
    elements.editorStatus.textContent = '';
    elements.editorStatus.className = 'editor-status';

    elements.emptyState.classList.add('hidden');
    elements.noteEditor.classList.remove('hidden');

    // Foco en el título
    elements.noteTitle.focus();
    renderNotesList();
}

/**
 * Maneja la selección de una nota de la lista
 * @param {string} noteId - ID de la nota a seleccionar
 */
async function handleSelectNote(noteId) {
    if (state.hasUnsavedChanges) {
        await handleSave();
    }

    const note = await fetchNoteById(noteId);
    if (note) {
        state.isNewNote = false;
        elements.editorMeta.style.display = 'flex';
        showEditor(note);
    }
}

/**
 * Maneja el guardado de la nota actual
 */
async function handleSave() {
    const title = elements.noteTitle.value.trim() || 'Sin título';
    const content = elements.noteContent.value.trim();

    // No guardar si ambos están vacíos para nuevas notas
    if (state.isNewNote && !title && !content) {
        return;
    }

    setEditorStatus('Guardando...', 'saving');

    // Si es una nueva nota, crearla primero
    if (state.isNewNote || !state.currentNoteId) {
        const created = await createNote({
            title: title,
            content: content || ' ', // Asegurar que el contenido no esté vacío
        });

        if (created) {
            state.currentNoteId = created.id;
            state.isNewNote = false;
            state.hasUnsavedChanges = false;
            elements.editorMeta.style.display = 'flex';
            elements.metaCreated.textContent = `Creada: ${formatFullDate(created.createdAt)}`;
            elements.metaUpdated.textContent = `Modificada: ${formatFullDate(created.updatedAt)}`;
            setEditorStatus('Guardado', 'saved');
            await loadNotes();
            showToast('Nota creada', 'success');
            setTimeout(() => setEditorStatus(''), 2000);
        } else {
            setEditorStatus('Error al guardar', 'error');
        }
        return;
    }

    // Actualizar nota existente
    const updated = await updateNote(state.currentNoteId, {
        title: title,
        content: content,
    });

    if (updated) {
        state.hasUnsavedChanges = false;
        setEditorStatus('Guardado', 'saved');
        elements.metaUpdated.textContent = `Modificada: ${formatFullDate(updated.updatedAt)}`;
        await loadNotes();
        setTimeout(() => setEditorStatus(''), 2000);
    } else {
        setEditorStatus('Error al guardar', 'error');
    }
}

/**
 * Maneja la eliminación de la nota actual
 */
async function handleDelete() {
    if (!state.currentNoteId) return;

    const result = await deleteNotes([state.currentNoteId]);

    if (result && result.deletedCount > 0) {
        hideDeleteModal();
        hideEditor();
        await loadNotes();
        showToast('Nota eliminada', 'success');
    }
}

/**
 * Maneja el cambio de ordenamiento
 */
async function handleSortChange() {
    const [sortBy, order] = elements.sortSelect.value.split('-');
    state.notes = await fetchNotes(sortBy, order);
    renderNotesList();
}

/**
 * Carga notas de la API
 */
async function loadNotes() {
    const [sortBy, order] = elements.sortSelect.value.split('-');
    state.notes = await fetchNotes(sortBy, order);
    renderNotesList();
}

// =============================================================================
// Event Listeners
// =============================================================================

// New note buttons
elements.btnNewNote.addEventListener('click', handleNewNote);
elements.btnNewNoteEmpty.addEventListener('click', handleNewNote);

// Note list click delegation
elements.notesList.addEventListener('click', (e) => {
    const noteItem = e.target.closest('.note-item');
    if (noteItem) {
        handleSelectNote(noteItem.dataset.id);
    }
});

// Sort change
elements.sortSelect.addEventListener('change', handleSortChange);

// Save button
elements.btnSave.addEventListener('click', handleSave);

// Delete button
elements.btnDelete.addEventListener('click', showDeleteModal);
elements.btnCancelDelete.addEventListener('click', hideDeleteModal);
elements.btnConfirmDelete.addEventListener('click', handleDelete);

// Close modal on overlay click
elements.deleteModal.addEventListener('click', (e) => {
    if (e.target === elements.deleteModal) {
        hideDeleteModal();
    }
});

// Track unsaved changes
elements.noteTitle.addEventListener('input', () => {
    state.hasUnsavedChanges = true;
});

elements.noteContent.addEventListener('input', () => {
    state.hasUnsavedChanges = true;
});

// Keyboard shortcuts
document.addEventListener('keydown', (e) => {
    // Ctrl/Cmd + S to save
    if ((e.ctrlKey || e.metaKey) && e.key === 's') {
        e.preventDefault();
        handleSave();
    }

    // Ctrl/Cmd + N to create new note
    if ((e.ctrlKey || e.metaKey) && e.key === 'n') {
        e.preventDefault();
        handleNewNote();
    }

    // Escape to close modal
    if (e.key === 'Escape' && !elements.deleteModal.classList.contains('hidden')) {
        hideDeleteModal();
    }
});

// Auto-save on blur
elements.noteTitle.addEventListener('blur', () => {
    if (state.hasUnsavedChanges) {
        handleSave();
    }
});

elements.noteContent.addEventListener('blur', () => {
    if (state.hasUnsavedChanges) {
        handleSave();
    }
});

// =============================================================================
// Initialization
// =============================================================================

/**
 * Initializes the application
 */
async function init() {
    await loadNotes();
    console.log('UCAB Tasks initialized');
}

// Start the app
init();
