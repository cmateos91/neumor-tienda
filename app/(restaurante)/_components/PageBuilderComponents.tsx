'use client';

import React from 'react';
import Link from 'next/link';
import { ChefHat, Award, Clock, MapPin, UtensilsCrossed, Wine, Star, Heart, Users, Leaf, Flame, Coffee } from 'lucide-react';
import EditableWrapper from './EditableWrapper';
import { PageComponent } from '@/lib/page-builder.types';
import { useRestaurant } from '@/lib/restaurant-context';

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  ChefHat, Award, Clock, MapPin, UtensilsCrossed, Wine, Star, Heart, Users, Leaf, Flame, Coffee
};

interface ComponentRendererProps {
  component: PageComponent;
  isEditMode?: boolean;
}

/**
 * Renderiza un componente de tipo Icon
 */
export function IconComponent({ component, isEditMode }: ComponentRendererProps) {
  const { props, style } = component;
  const iconName = props.iconName as string;
  const size = props.size as string || 'medium';

  const Icon = iconMap[iconName] || Star;

  const sizeClasses = {
    small: 'w-16 h-16',
    medium: 'w-20 h-20',
    large: 'w-24 h-24'
  };

  const iconSizes = {
    small: 'w-8 h-8',
    medium: 'w-10 h-10',
    large: 'w-12 h-12'
  };

  return (
    <div
      className={`neuro-pressed rounded-full ${sizeClasses[size as keyof typeof sizeClasses]} mx-auto mb-8 flex items-center justify-center`}
      style={{
        textAlign: style?.textAlign as any,
        ...(isEditMode && { outline: '2px dashed rgba(212, 175, 55, 0.3)' })
      }}
    >
      <Icon className={`${iconSizes[size as keyof typeof iconSizes]} text-[#d4af37]`} />
    </div>
  );
}

/**
 * Renderiza un componente de tipo Heading
 */
export function HeadingComponent({ component, isEditMode }: ComponentRendererProps) {
  const { config } = useRestaurant();
  const { props, style } = component;
  const level = (props.level as number) || 1;
  const textKey = props.text as string;
  const elementId = props.elementId as string;

  // Obtener el texto desde el config según la key
  const text = textKey === 'nombre' ? config?.nombre || 'Mi Restaurante' : config?.tagline || '';

  const HeadingTag = `h${level}` as keyof JSX.IntrinsicElements;

  const baseClasses = {
    1: 'text-5xl md:text-7xl font-bold text-[#2c2c2c] mb-6 tracking-tight',
    2: 'text-4xl md:text-5xl font-bold text-[#2c2c2c] mb-4',
    3: 'text-3xl md:text-4xl font-bold text-[#2c2c2c] mb-3',
    4: 'text-2xl md:text-3xl font-bold text-[#2c2c2c] mb-2',
    5: 'text-xl md:text-2xl font-bold text-[#2c2c2c] mb-2',
    6: 'text-lg md:text-xl font-bold text-[#2c2c2c] mb-2'
  };

  return (
    <EditableWrapper
      elementId={elementId}
      as={HeadingTag}
      className={`${baseClasses[level as keyof typeof baseClasses]} transition-all`}
      style={{
        textAlign: style?.textAlign as any,
        fontSize: style?.fontSize,
        ...(isEditMode && { outline: '2px dashed rgba(212, 175, 55, 0.3)' })
      }}
    >
      {text}
    </EditableWrapper>
  );
}

/**
 * Renderiza un componente de tipo Paragraph
 */
export function ParagraphComponent({ component, isEditMode }: ComponentRendererProps) {
  const { config, textos } = useRestaurant();
  const { props, style } = component;
  const textKey = props.text as string;
  const elementId = props.elementId as string;

  // Obtener el texto desde el config/textos según la key
  const text = textKey === 'tagline'
    ? config?.tagline || 'Bienvenido a nuestra experiencia gastronómica'
    : textos.inicio[textKey as keyof typeof textos.inicio] || '';

  return (
    <EditableWrapper
      elementId={elementId}
      as="p"
      className="text-xl md:text-2xl text-[#666666] mb-8 max-w-3xl mx-auto leading-relaxed transition-all"
      style={{
        textAlign: style?.textAlign as any,
        fontSize: style?.fontSize,
        ...(isEditMode && { outline: '2px dashed rgba(212, 175, 55, 0.3)' })
      }}
    >
      {text}
    </EditableWrapper>
  );
}

/**
 * Renderiza un componente de tipo Button
 */
export function ButtonComponent({ component, isEditMode }: ComponentRendererProps) {
  const { textos } = useRestaurant();
  const { props, style } = component;
  const textKey = props.text as string;
  const href = props.href as string;
  const variant = props.variant as string || 'primary';
  const elementId = props.elementId as string;

  // Obtener el texto del botón desde textos
  const buttonText = textos.inicio[textKey as keyof typeof textos.inicio] || textKey;

  const variantClasses = {
    primary: 'neuro-flat neuro-hover rounded-2xl px-8 py-4 text-[#2c2c2c] font-semibold',
    secondary: 'neuro-pressed rounded-2xl px-8 py-4 text-[#d4af37] font-semibold'
  };

  return (
    <EditableWrapper elementId={elementId}>
      <Link href={href} prefetch={true}>
        <button
          className={`${variantClasses[variant as keyof typeof variantClasses]} w-full sm:w-auto transition-all cursor-pointer`}
          style={{
            textAlign: style?.textAlign as any,
            ...(isEditMode && { outline: '2px dashed rgba(212, 175, 55, 0.3)' })
          }}
        >
          {buttonText}
        </button>
      </Link>
    </EditableWrapper>
  );
}

/**
 * Renderizador principal que delega según el tipo de componente
 */
export function ComponentRenderer({ component, isEditMode }: ComponentRendererProps) {
  switch (component.type) {
    case 'icon':
      return <IconComponent component={component} isEditMode={isEditMode} />;
    case 'heading':
      return <HeadingComponent component={component} isEditMode={isEditMode} />;
    case 'paragraph':
      return <ParagraphComponent component={component} isEditMode={isEditMode} />;
    case 'button':
      return <ButtonComponent component={component} isEditMode={isEditMode} />;
    default:
      return null;
  }
}
