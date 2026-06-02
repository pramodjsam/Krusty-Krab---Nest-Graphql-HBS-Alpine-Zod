import Alpine from 'alpinejs';
import { categoryAdminPage } from './admin/category';

(window as any).Alpine = Alpine;
Alpine.data('categoryAdminPage', categoryAdminPage);

Alpine.start();
