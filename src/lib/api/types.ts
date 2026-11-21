// Typed directly from backend v0.2 openapi.yaml; fields preserved without speculative additions.
export type Language = 'en' | 'uk';
export type SortOrder = 'newest' | 'oldest' | 'title' | '-title';
export interface Seo {title?:string; description?:string; canonical?:string; og_title?:string; og_description?:string; og_image?:string|null; index?:boolean; robots?:string|null}
export interface CategorySummary {slug:string;name:string}
export interface Category {id:string;slug:string;name:string;description:string;language:string;parent_slug:string|null;seo:Seo|null}
export type AttributeDataType = 'text'|'number'|'boolean'|'single_select'|'multi_select';
/** Backend attribute.value is JSON: string, scalar, selected codes array, or null. */
export interface Attribute {code:string;label:string;data_type:AttributeDataType;value:string|number|boolean|string[]|null}
export interface TemplateList {id:string;slug:string;title:string;summary:string;language:string;published_at:string;categories:CategorySummary[];cover_preview_url?:string|null}
export interface DocumentFormat {id:string;format:string;filename:string;byte_size:number;download_url:string|null}
export interface DocumentVariant {id:string;code:string;label?:string|null;page_size?:string|null;orientation?:string|null;is_default?:boolean;files:DocumentFormat[]}
export interface DocumentPreview {file_id:string;page:number;width:number;height:number;url:string}
export interface TemplateQuickPreview extends TemplateList {license_code:string;formats:DocumentFormat[]}
export interface TemplateDetail extends TemplateQuickPreview {description:string;usage_instructions:string;previews:DocumentPreview[];attributes:Attribute[];seo:Seo|null;variants?:DocumentVariant[]}
export interface Page<T> {count:number;next:string|null;previous:string|null;results:T[]}
export type FilterType = 'single_select' | 'multi_select' | 'boolean';
export interface FilterOption {value:string;label:string;count:number}
export interface CatalogFilter {key:string;type:FilterType;label:string;order:number;options:FilterOption[]}
export interface FiltersResponse {language:Language;filters:CatalogFilter[]}
export interface CatalogQuery {lang:Language;page?:number;page_size?:number;category?:string;q?:string;sort?:SortOrder;format?:string|string[];attributes?:Record<string,string>;rawAttributes?:Record<string,string[]>}

