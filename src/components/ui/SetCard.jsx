import React from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { Layers, MoreVertical, Globe, Lock, Trash2, Edit2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { motion } from 'framer-motion';

export default function SetCard({ set, onDelete, onEdit }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="group relative bg-white rounded-xl border border-slate-200 p-5 hover:shadow-lg hover:border-slate-300 transition-all duration-300"
    >
      <Link to={createPageUrl(`SetDetails?id=${set.id}`)}>
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
              <Layers className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="font-semibold text-slate-900 group-hover:text-indigo-600 transition-colors">
                {set.title}
              </h3>
              <div className="flex items-center gap-1 text-xs text-slate-500">
                {set.is_public ? (
                  <>
                    <Globe className="w-3 h-3" />
                    <span>Public</span>
                  </>
                ) : (
                  <>
                    <Lock className="w-3 h-3" />
                    <span>Private</span>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
        
        {set.description && (
          <p className="text-sm text-slate-500 mb-3 line-clamp-2">{set.description}</p>
        )}
        
        <div className="flex items-center gap-4 text-sm text-slate-500">
          <span className="font-medium">{set.card_count || 0} cards</span>
          {set.category && (
            <span className="px-2 py-0.5 bg-slate-100 rounded-full text-xs">
              {set.category}
            </span>
          )}
        </div>
      </Link>

      <div className="absolute top-4 right-4" onClick={(e) => e.stopPropagation()}>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity">
              <MoreVertical className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => onEdit?.(set)}>
              <Edit2 className="h-4 w-4 mr-2" />
              Edit
            </DropdownMenuItem>
            <DropdownMenuItem 
              className="text-red-600"
              onClick={() => onDelete?.(set)}
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </motion.div>
  );
}